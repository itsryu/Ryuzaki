import { AppStructure } from '../../Structures';
import express, { Express, Router } from 'express';
import { Client, RESTGetAPIUserResult, RESTPostOAuth2AccessTokenResult, Snowflake } from 'discord.js';
import { urlencoded, json } from 'body-parser';
import { InfoMiddleware, AuthMiddleware } from './middlewares/index';
import { Logger, Util } from '../../Utils/util';
import { Route } from '../../Types/HTTPSInterfaces';
import { HomeController, NotFoundController, HealthCheckController, DBLController, DiscordUserController } from './routes/index';
import cors from 'cors';
import { verifyKey } from 'discord-interactions';
import { JSONResponse } from '../../Structures/RouteStructure';
import { Api, Webhook } from '@top-gg/sdk';
import { DataDocument, DataType, Languages } from '../../Types/ClientTypes';
import { ClientModel, CommandModel, GuildModel, UserModel } from '../../Database';
import { Translate } from '../../../Lib/Translate';

export default class App extends AppStructure {
    private readonly app: Express = express();
    public readonly logger: Logger = new Logger();
    public readonly utils: Util = new Util();
    public readonly stats: Api = new Api(process.env.DBL_TOKEN);
    public store = new Map<string, RESTPostOAuth2AccessTokenResult>();
    public readonly translate: Translate = new Translate(process.env.LANG_PATH);
    public t!: typeof this.translate.t;
    public readonly database: {
        client: typeof ClientModel;
        guilds: typeof GuildModel;
        users: typeof UserModel;
        commands: typeof CommandModel;
    } = {
            client: ClientModel,
            guilds: GuildModel,
            users: UserModel,
            commands: CommandModel
        };

    serverExecute() {
        this.configServer();
        this.listen(process.env.PORT);
    }

    private configServer(): void {
        this.app.use(cors());
        this.app.use(json());
        this.app.use(express.json({ verify: this.verifyDiscordRequest(process.env.PUBLIC_KEY) }));
        this.app.use(urlencoded({ extended: true }));
        this.app.use(this.initRoutes());
    }

    private listen(port: string | number) {
        setInterval(async () => {
            try {
                const guildsArray = await this.shard.manager.broadcastEval((client: Client) => client.guilds.cache.size);
                const totalGuilds = guildsArray?.reduce((acc, guilds) => acc + guilds, 0) ?? 0;

                await this.stats.postStats({
                    serverCount: totalGuilds,
                    shardCount: this.shard.manager.shards.size,
                    shards: this.shard.manager.shards.map((shard) => shard.id)
                });

                this.logger.info('Updated stats on Top.gg website.', 'DBL');
            } catch (err) {
                this.logger.error('Error while updating stats to top.gg website: ' + (err as Error).message, 'DBL');
            }
        }, 30 * 60 * 1000); // Updating every 30 minutes;

        this.app.listen(port, () => {
            this.logger.info(`[WEB Socket] Server started on port: ${port.toString()}`, 'Server');
            this.logger.info(`[WEB Socket] http://localhost:${port.toString()}`, 'Server');
        });
    }

    private initRoutes(): Router {
        const router = Router();
        const routes = this.loadRoutes();

        routes.forEach((route) => {
            const { method, path, handler } = route;

            switch (method) {
                case 'GET': {
                    router.get(path, new InfoMiddleware(this).run, new AuthMiddleware(this).run, async (req, res, next) => {
                        await handler.run(req, res, next);
                    });

                    break;
                }

                case 'POST': {
                    router.post(path, new InfoMiddleware(this).run, async (req, res, next) => {
                        if (path.includes('/dblwebhook')) {
                            const webhook = new Webhook(process.env.AUTH_KEY);

                            await webhook.listener((vote) => handler.run(req, res, next, vote, this.shard))(req, res, next);
                        } else {
                            await handler.run(req, res, next);
                        }
                    });

                    break;
                }
                default:
                    break;
            }
        });

        router.get('*', new NotFoundController(this).run);

        return router;
    }

    private loadRoutes(): Route[] {
        const routes: Route[] = [
            { method: 'GET', path: '/', handler: new HomeController(this) },
            { method: 'GET', path: '/health', handler: new HealthCheckController(this) },
            { method: 'GET', path: '/api/discord/user/:id', handler: new DiscordUserController(this) },
            { method: 'GET', path: '/linked-role', handler: new DiscordUserController(this) },
            { method: 'GET', path: '/discord-oauth-callback', handler: new DiscordUserController(this) },
            { method: 'POST', path: '/dblwebhook', handler: new DBLController(this) }
        ];

        return routes;
    }

    private verifyDiscordRequest(clientKey: string) {
        return async function (req: express.Request, res: express.Response, buffer: Buffer) {
            const signature = req.get('X-Signature-Ed25519');
            const timestamp = req.get('X-Signature-Timestamp');

            if (!signature || !timestamp) {
                res.status(401).json(new JSONResponse(401, 'Unauthorized').toJSON());
                return;
            } else {
                const isValidRequest = await verifyKey(buffer, signature, timestamp, clientKey);

                if (!isValidRequest) {
                    res.status(401).json(new JSONResponse(401, 'Bad request signature').toJSON());
                } else {
                    res.status(200).send();
                }
            }
        };
    }

    public getOAuthUrl() {
        const state = crypto.randomUUID();

        const url = new URL('https://discord.com/api/oauth2/authorize');
        url.searchParams.set('client_id', process.env.CLIENT_ID);
        url.searchParams.set('redirect_uri', process.env.DOMAIN_URL + '/discord-oauth-callback');
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('state', state);
        url.searchParams.set('scope', 'role_connections.write identify');
        url.searchParams.set('prompt', 'consent');

        return { state, url: url.toString() };
    }

    public async getOAuthTokens(code: string) {
        const url = 'https://discord.com/api/v10/oauth2/token';
        const body = new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.DOMAIN_URL + '/discord-oauth-callback'
        });

        const response = await fetch(url, {
            body,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.ok) {
            const data = await response.json() as RESTPostOAuth2AccessTokenResult;

            return data;
        } else {
            throw new Error(`Error fetching OAuth tokens: [${response.status.toString()}] ${response.statusText}`);
        }
    }

    private async getAccessToken(userId: Snowflake, tokens: RESTPostOAuth2AccessTokenResult) {
        if (Date.now() > tokens.expires_in) {
            const url = 'https://discord.com/api/v10/oauth2/token';
            const body = new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: tokens.refresh_token
            });

            const response = await fetch(url, {
                body,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.ok) {
                const tokens = await response.json() as RESTPostOAuth2AccessTokenResult;
                tokens.access_token = tokens.access_token;
                tokens.expires_in = Date.now() + tokens.expires_in * 1000;
                this.storeDiscordTokens(userId, tokens);
                return tokens.access_token;
            } else {
                throw new Error(`Error refreshing access token: [${response.status.toString()}] ${response.statusText}`);
            }
        }

        return tokens.access_token;
    }

    public async getUserData(tokens: RESTPostOAuth2AccessTokenResult) {
        try {
            const url = 'https://discord.com/api/v10/oauth2/@me';

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`
                }
            });

            if (response.ok) {
                const data = await response.json() as RESTGetAPIUserResult;
                return data;
            } else {
                this.logger.error(`Error fetching user data: [${response.status.toString()}] ${response.statusText}`, 'getUserData');
            }
        } catch (err) {
            this.logger.error((err as Error).message, 'getUserData');
            this.logger.warn((err as Error).stack, 'getUserData');
        }
    }

    private async pushMetadata(userId: Snowflake, tokens: RESTPostOAuth2AccessTokenResult, metadata: Record<string, unknown>) {
        const url = `https://discord.com/api/v10/users/@me/applications/${process.env.CLIENT_ID}/role-connection`;
        const accessToken = await this.getAccessToken(userId, tokens);
        const body = {
            platform_name: 'Example Linked Role Discord Bot',
            metadata
        };
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Error pushing discord metadata: [${response.status.toString()}] ${response.statusText}`);
        }
    }

    public async getMetadata(userId: Snowflake, tokens: RESTPostOAuth2AccessTokenResult) {
        const url = `https://discord.com/api/v10/users/@me/applications/${process.env.CLIENT_ID}/role-connection`;
        const accessToken = await this.getAccessToken(userId, tokens);
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Error getting discord metadata: [${response.status.toString()}] ${response.statusText}`);
        }
    }

    public async updateMetadata(userId: Snowflake) {
        const tokens = this.getDiscordTokens(userId);

        let metadata: Record<string, unknown> = {};

        try {
            metadata = {
                cookieseaten: 1483,
                allergictonuts: false,
                firstcookiebaked: '2003-12-20'
            };
        } catch (err: unknown) {
            (err as Error).message = `Error fetching external data: ${(err as Error).message}`;
            console.error(err);
        }

        tokens && await this.pushMetadata(userId, tokens, metadata);
    }

    public storeDiscordTokens(userId: Snowflake, tokens: RESTPostOAuth2AccessTokenResult) {
        this.store.set(`discord-${userId}`, tokens);
    }

    public getDiscordTokens(userId: Snowflake) {
        return this.store.get(`discord-${userId}`);
    }

    public async getLanguage(id: string): Promise<Languages> {
        const guild = await this.shard.eval(async (client) => await client.guilds.fetch(id).catch(() => undefined));
        const user = guild ? null : await this.shard.eval(async (client) => await client.users.fetch(id).catch(() => undefined));

        if (guild) {
            const guildData = await this.getData(guild.id, 'guild');
            const languages: Languages[] = ['pt-BR', 'en-US', 'es-ES'];

            await guildData?.updateOne({ $set: { lang: languages.some((lang) => lang === guild.preferredLocale) ? guild.preferredLocale : 'en-US' } }, { new: true });

            return guildData?.lang as Languages;
        } else {
            const userData = await this.getData(user?.id, 'user');

            await userData?.updateOne({ $set: { lang: 'pt-BR' } }, { new: true });

            return userData?.lang as Languages;
        }
    }

    public async getTranslate(id: string) {
        const language = await this.getLanguage(id);
        this.t = await this.translate.init();

        this.translate.setLang(language);
        return this.t;
    }

    public async getData<T extends DataType>(
        id: string | undefined,
        type: T
    ) {
        switch (type) {
            case 'user': {
                if (id) {
                    const user = await this.shard.eval(async (client) => await client.users.fetch(id).catch(() => undefined));

                    if (user) {
                        let data = await this.database.users.findOne({ _id: user.id });

                        try {
                            if (!data) {
                                data = await this.database.users.create({ _id: user.id });
                            }

                            return data as DataDocument<T>;
                        } catch (err) {
                            this.logger.error((err as Error).message, [App.name, this.getData.name]);
                            this.logger.warn((err as Error).stack, [App.name, this.getData.name]);
                        }
                    } else {
                        return undefined;
                    }
                }

                break;
            }

            case 'guild': {
                if (id) {
                    const guild = await this.shard.eval(async (client) => await client.guilds.fetch(id).catch(() => undefined));

                    if (guild) {
                        try {
                            let data = await this.database.guilds.findOne({ _id: guild.id });

                            if (!data) {
                                data = await this.database.guilds.create({ _id: guild.id });
                            }

                            return data as DataDocument<T>;
                        } catch (err) {
                            this.logger.error((err as Error).message, [App.name, this.getData.name]);
                            this.logger.warn((err as Error).stack, [App.name, this.getData.name]);
                        }
                    } else {
                        return undefined;
                    }
                }

                break;
            }
            default: {
                return undefined;
            }
        }
    }
}
