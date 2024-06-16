import { Ryuzaki } from '../RyuzakiClient';
import { AppStructure } from '../Structures';
import { Server } from 'node:http';
import express, { Express, Router } from 'express';
import { Client, } from 'discord.js';
import { urlencoded, json } from 'body-parser';
import { InfoMiddleware, CommandMiddleware } from './middlewares/index';
import { Logger } from '../Utils/util';
import { Route } from '../Types/HTTPSInterfaces';
import { HomeController, NotFoundController, HealthCheckController, DBLController } from './routes/index';
import { Webhook } from '@top-gg/sdk';
import { CommandExecuteController } from './routes/CommandExecuteController';

export default class App extends AppStructure {
    private readonly app: Express = express();
    public readonly logger: Logger = new Logger();
    private server!: Server;

    constructor(client: Ryuzaki) {
        super(client);
    }

    async serverExecute(): Promise<void> {
        this.configServer();
        await this.listen(process.env.PORT);
    }

    private configServer(): void {
        this.app.set('view engine', 'html');
        this.app.use(urlencoded({ extended: true }));
        this.app.use(json());
        this.app.use(this.initRoutes());
    }

    private async listen(port: string | number): Promise<Server> {
        const shardIds = this.client.shard?.ids || [];


        for (const shardId of shardIds) {
            const shardClient = await this.client.shard?.broadcastEval(
                (client, { shardId }) => client.shard?.ids.includes(shardId) ? shardId : null,
                { context: { shardId } }
            );

            if (shardClient?.length && shardClient.length > 0) {
                setInterval(async () => {
                    try {
                        const guildsArray = await this.client.shard?.broadcastEval(
                            (client: Client) => client.guilds.cache.size
                        );
                        const totalGuilds = guildsArray?.reduce((prev: number, count: number) => prev + count, 0) || 0;

                        await this.client.stats.postStats({
                            serverCount: totalGuilds,
                            shardCount: this.client.shard?.ids.length,
                            shardId: shardId,
                            shards: this.client.shard?.ids
                        });

                        this.client.logger.info('Updated stats on top.gg website.', 'Top.gg');
                    } catch (err) {
                        this.client.logger.error(
                            'Error while updating stats to top.gg website: ' + (err as Error).message,
                            App.name
                        );
                    }
                }, 30 * 60 * 1000);
            }
        }

        this.server = this.app.listen(port, () => {
            this.client.logger.info(`[WEB Socket] Server started on port: ${port}`, 'Server');
            this.client.logger.info(`[WEB Socket] http://localhost:${port}`, 'Server');
        });

        return this.server;
    }

    private initRoutes(): Router {
        const router = Router();
        const routes = this.loadRoutes();

        routes.forEach((route) => {
            const { method, path, handler } = route;

            switch (method) {
                case 'GET': {
                    router.get(path, new InfoMiddleware(this).run, async (req, res, next) => {
                        return await handler.run(req, res, next);
                    });

                    break;
                }
                case 'POST': {
                    router.post(path, new InfoMiddleware(this).run, async (req, res, next) => {
                        if (path.includes('/dblwebhook')) {
                            const webhook = new Webhook(process.env.DBL_WH_AUTH);

                            webhook.listener(async (vote) => await handler.run(req, res, next, vote, this.client));
                        } else if (path.includes('/command') && req.params.name) {
                            const commandMiddleware = new CommandMiddleware(this)

                            await commandMiddleware.run(req, res, () => {
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
            { method: 'POST', path: '/command/:name', handler: new CommandExecuteController(this) },
            { method: 'POST', path: '/dblwebhook', handler: new DBLController(this) }
        ];

        return routes;
    }
}
