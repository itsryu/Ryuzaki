import { Ryuzaki } from '../../RyuzakiClient';
import { AppStructure } from '../../Structures';
import express, { Express, Router } from 'express';
import { Client, } from 'discord.js';
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
            { method: 'POST', path: '/api/interactions/', handler: new InteractionController(this) },
            { method: 'POST', path: '/command/:name', handler: new CommandExecuteController(this) },
            { method: 'POST', path: '/dblwebhook', handler: new DBLController(this) }
        ];

        return routes;
    }

    private verifyDiscordRequest(clientKey: string) {
        return function (req, res, buf: Buffer) {
            const signature = req.get('X-Signature-Ed25519');
            const timestamp = req.get('X-Signature-Timestamp');

            const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);

            if (!isValidRequest) {
                res.status(401).json(new JSONResponse(401, 'Bad request signature').toJSON());
            }
        };
    }
}