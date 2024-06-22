import { Ryuzaki } from '../../RyuzakiClient';
import { AppStructure } from '../../Structures';
import express, { Express, Router } from 'express';
import { Client, RESTGetAPIUserResult, RESTPostOAuth2AccessTokenResult, Snowflake, } from 'discord.js';
import { urlencoded, json } from 'body-parser';
import { InfoMiddleware, CommandMiddleware, AuthMiddleware } from './middlewares/index';
import { Logger } from '../../Utils/util';
import { Route } from '../../Types/HTTPSInterfaces';
import { HomeController, NotFoundController, HealthCheckController, DBLController, DiscordUserController, CommandExecuteController, InteractionController } from './routes/index';
import { Webhook } from '@top-gg/sdk';
import cors from 'cors';
import { verifyKey } from 'discord-interactions';
import { JSONResponse } from '../../Structures/RouteStructure';

export default class App extends AppStructure {
    private readonly app: Express = express();
    public readonly logger: Logger = new Logger();
    public store: Map<string, RESTPostOAuth2AccessTokenResult> = new Map();

    constructor(client: Ryuzaki) {
        super(client);
    }

    async serverExecute(): Promise<void> {
        this.configServer();
        await this.listen(process.env.PORT);
    }

    private configServer(): void {
        this.app.use(cors());
        this.app.use(json());
        this.app.use(express.json({ verify: this.verifyDiscordRequest(process.env.PUBLIC_KEY) }));
        this.app.use(urlencoded({ extended: true }));
        this.app.use(this.initRoutes());
    }

    private async listen(port: string | number) {
        const shardIds = this.client.shard?.ids || [];

        for (const shardId of shardIds) {
            const shardClient = await this.client.shard?.broadcastEval(
                (client, { shardId }) => client.shard?.ids.includes(shardId) ? shardId : null,
                { context: { shardId } }
            );

            if (shardClient?.length && shardClient.length > 0) {
                setInterval(async () => {
                    try {
                        const guildsArray = await this.client.shard?.broadcastEval((client: Client) => client.guilds.cache.size);
                        const totalGuilds = guildsArray?.reduce((prev: number, count: number) => prev + count, 0) || 0;

                        await this.client.stats.postStats({
                            serverCount: totalGuilds,
                            shardCount: this.client.shard?.ids.length,
                            shardId: shardId,
                            shards: this.client.shard?.ids
                        });

                        this.client.logger.info('Updated stats on Top.gg website.', 'DBL');
                    } catch (err) {
                        this.client.logger.error('Error while updating stats to top.gg website: ' + (err as Error).message, 'DBL');
                    }
                }, 30 * 60 * 1000); // Updating every 30 minutes;
            }
        }

        this.app.listen(port, () => {
            this.client.logger.info(`[WEB Socket] Server started on port: ${port}`, 'Server');
            this.client.logger.info(`[WEB Socket] http://localhost:${port}`, 'Server');
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
                        return await handler.run(req, res, next);
                    });

                    break;
                }
                case 'POST': {
                    router.post(path, new InfoMiddleware(this).run, async (req, res, next) => {
                        if (path.includes('/dblwebhook')) {
                            const webhook = new Webhook(process.env.AUTH_KEY);

                            webhook.listener(async (vote) => {
                                return handler.run(req, res, next, vote, this.client);
                            })(req, res, next);
                        } else if (path.includes('/command') || path.includes('/api/interactions')) {
                            const commandMiddleware = new CommandMiddleware(this)

                            commandMiddleware.run(req, res, () => {
                                return handler.run(req, res, next, this.client);
                            }, this.client);
                        } else {
                            return await handler.run(req, res, next);
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

    private loadRoutes(): Array<Route> {
        const routes: Array<Route> = [
            { method: 'GET', path: '/', handler: new HomeController(this) },
            { method: 'GET', path: '/health', handler: new HealthCheckController(this) },
            { method: 'GET', path: '/api/discord/user/:id', handler: new DiscordUserController(this) },
            { method: 'GET', path: '/linked-role', handler: new DiscordUserController(this) },
            { method: 'GET', path: '/discord-oauth-callback', handler: new DiscordUserController(this) },
            { method: 'POST', path: '/update-metadata', handler: new InteractionController(this) },
            { method: 'POST', path: '/api/interactions', handler: new InteractionController(this) },
            { method: 'POST', path: '/command/:name', handler: new CommandExecuteController(this) },
            { method: 'POST', path: '/dblwebhook', handler: new DBLController(this) }
        ];

        return routes;
    }

    private verifyDiscordRequest(clientKey: string) {
        return function (req, res, buffer: Buffer) {
            const signature = req.get('X-Signature-Ed25519');
            const timestamp = req.get('X-Signature-Timestamp');

            const isValidRequest = verifyKey(buffer, signature, timestamp, clientKey);

            if (!isValidRequest) {
                res.status(401).json(new JSONResponse(401, 'Bad request signature').toJSON());
            } else {
                res.status(200);
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

    public async getOAuthTokens(code) {
        const url = 'https://discord.com/api/v10/oauth2/token';
        const body = new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.DOMAIN_URL + '/discord-oauth-callback',
        });

        const response = await fetch(url, {
            body,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.ok) {
            const data = await response.json() as RESTPostOAuth2AccessTokenResult;

            return data;
        } else {
            throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`);
        }
    }

    private async getAccessToken(userId, tokens) {
        if (Date.now() > tokens.expires_at) {
            const url = 'https://discord.com/api/v10/oauth2/token';
            const body = new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: tokens.refresh_token,
            });

            const response = await fetch(url, {
                body,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })

            if (response.ok) {
                const tokens = await response.json() as RESTPostOAuth2AccessTokenResult;
                tokens.access_token = tokens.access_token;
                tokens.expires_in = Date.now() + tokens.expires_in * 1000;
                await this.storeDiscordTokens(userId, tokens);
                return tokens.access_token;
            } else {
                throw new Error(`Error refreshing access token: [${response.status}] ${response.statusText}`);
            }
        }

        return tokens.access_token as string;
    }

    public async getUserData(tokens: RESTPostOAuth2AccessTokenResult) {
        try {
            const url = 'https://discord.com/api/v10/oauth2/@me';

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            });

            if (response.ok) {
                const data = await response.json() as RESTGetAPIUserResult;
                return data;
            } else {
                this.logger.error(`Error fetching user data: [${response.status}] ${response.statusText}`, 'getUserData');
            }
        } catch (err) {
            this.logger.error((err as Error).message, 'getUserData');
            this.logger.warn((err as Error).stack as string, 'getUserData');
        }
    }

    private async pushMetadata(userId: Snowflake, tokens: RESTPostOAuth2AccessTokenResult, metadata) {
        const url = `https://discord.com/api/v10/users/@me/applications/${process.env.CLIENT_ID}/role-connection`;
        const accessToken = await this.getAccessToken(userId, tokens);
        const body = {
            platform_name: 'Example Linked Role Discord Bot',
            metadata,
        };
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error pushing discord metadata: [${response.status}] ${response.statusText}`);
        }
    }

    public async getMetadata(userId: Snowflake, tokens: RESTPostOAuth2AccessTokenResult) {
        const url = `https://discord.com/api/v10/users/@me/applications/${process.env.CLIENT_ID}/role-connection`;
        const accessToken = await this.getAccessToken(userId, tokens);
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Error getting discord metadata: [${response.status}] ${response.statusText}`);
        }
    }

    public async updateMetadata(userId: Snowflake) {
        const tokens = this.getDiscordTokens(userId);

        let metadata = {};
        try {
            metadata = {
                cookieseaten: 1483,
                allergictonuts: false,
                firstcookiebaked: '2003-12-20',
            };
        } catch (e: any) {
            e.message = `Error fetching external data: ${e.message}`;
            console.error(e);
        }

        tokens && await this.pushMetadata(userId, tokens, metadata);
    }

    public storeDiscordTokens(userId: Snowflake, tokens: RESTPostOAuth2AccessTokenResult) {
        this.store.set(`discord-${userId}`, tokens);
    }

    public getDiscordTokens(userId: Snowflake) {
        return this.store.get(`discord-${userId}`);
    }
}
