import { Ryuzaki } from '../RyuzakiClient';
import { AppStructure } from '../Structures';
import { resolve } from 'node:path';
import { Server } from 'node:http';
import express, { Express, Router } from 'express';
import { Client, } from 'discord.js';
import { urlencoded, json } from 'body-parser';
import { InfoMiddleware, CommandMiddleware } from './middlewares/index';
import { Logger } from '../Utils/util';
import { Route } from '../Types/HTTPSInterfaces';
import { HomeController, NotFoundController, HealthCheckController, TopGGController } from './routes/index';
import { Webhook } from '@top-gg/sdk';
import { CommandExecuteController } from './routes/CommandExecuteController';

export default class App extends AppStructure {
    private readonly app: Express = express();
    public readonly logger: Logger = new Logger();
    private server!: Server;
    private token!: string;

    constructor(client: Ryuzaki, token: string) {
        super(client);

        this.token = token;
        this.server;
    }

    async serverExecute(): Promise<void> {
        this.configServer();
        await this.listen(process.env.PORT);
    }

    private configServer(): void {
        this.app.set('view engine', 'html');
        this.app.set('views', resolve(__dirname, '..', '..', '..', 'src', 'Web', 'views'));
        this.app.set('views', resolve(__dirname, '..', '..', '..', 'src', 'Web', 'views', 'commands'));
        this.app.use(express.static(resolve(__dirname, '..', '..', '..', 'src', 'Web', 'public')));
        this.app.use(urlencoded({ extended: true }));
        this.app.use(json());
        this.app.use(this.initRoutes());
    }

    private async listen(port: string | number): Promise<Server> {
        const shardIds = this.client.shard?.ids!;

        for (const shardId of shardIds) {
            const shardClient = await this.client.shard?.broadcastEval((client, { shardId }) => client.shard?.ids.includes(shardId) ? shardId : null, { context: { shardId } });

            if (shardClient?.length) {
                const shardPort = Number(port) + Number(shardId);

                setInterval(async () => {
                    const guildsArray = await this.client.shard?.broadcastEval((client: Client) => client.guilds.cache.size);
                    const totalGuilds = guildsArray?.reduce((prev: number, count: number) => prev + count, 0);

                    try {
                        await this.client.stats.postStats({
                            serverCount: totalGuilds,
                            shardCount: this.client.shard?.ids.length,
                            shardId: shardId,
                            shards: this.client.shard?.ids
                        });

                        this.client.logger.info('Updated stats on top.gg website.', 'Top.gg');
                    } catch (err) {
                        this.client.logger.error('Error while updating stats to top.gg website: ' + (err as Error).message, App.name);
                    }
                }, 30 * 60 * 1000);

                this.server = this.app.listen(process.env.PORT || 3000, () => {
                    this.client.logger.info(`[WEB Socket] API Websocket started on shard [${shardId}] on port ` + shardPort, 'WebSocket');
                    this.client.logger.info('[WEB Socket] http://localhost:' + shardPort + '?token=' + this.token, 'Websocket');
                });
            }
        }

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
                            const webhook = new Webhook(process.env.TOPGG_WH_AUTH);

                            webhook.listener(async (vote) => {
                                return await handler.run(req, res, next, vote, this.client);
                            });
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
            { method: 'POST', path: '/dblwebhook', handler: new TopGGController(this) }
        ];

        return routes;
    }

    /*
    private registerRoots(): void {
        const guilds: Guild[] = [];
        this.client.guilds.cache.forEach(guild => {
            guilds.push(guild);
        });

        const commands = new Collection<string, CommandStructure>();
        this.client.commands.forEach(command => {
            commands.set(command.data.options.name, command);
        });

        this.app.get('/say', (req, res) => {
            const token = req.query.token as string;

            if (!this.checkToken(token)) {
                res.render('error', { title: 'ERROR' });
                return;
            }

            const sayCommand = commands.get('say');

            res.render('say', {
                token,
                title: sayCommand?.data.options.name,
                data: sayCommand,
                guilds
            });
        });

        this.app.get('/eval', (req, res) => {
            const token = req.query.token as string;

            if (!this.checkToken(token)) {
                res.render('error', { title: 'ERROR' });
                return;
            }

            const evalCommand = commands.get('eval');

            res.render('eval', {
                token,
                title: evalCommand?.data.options.name,
                data: evalCommand
            });
        });

        this.app.post('/evalPost', async (req, res) => {
            const token = req.body.token;
            const guildId = req.body.guild;
            const channelId = req.body.channel;
            const message = req.body.text;

            if (!token || !channelId || !guildId || !message) {
                return res.sendStatus(400);
            }

            if (!this.checkToken(token)) {
                return res.sendStatus(401);
            }

            const guild = this.client.guilds.cache.get(guildId);
            const channel = guild?.channels.cache.get(channelId) as TextChannel;

            if (channel) {
                await channel.sendTyping();
                await channel.send(message);
                res.sendStatus(200);
            } else {
                res.sendStatus(406);
            }
        });

        this.app.get('/guildId/:id', (req, res) => {
            const id = req.params.id;

            if (id) {
                const guild = this.client.guilds.cache.get(id);
                const channels = guild?.channels.cache.filter(channel => channel.type === ChannelType.GuildText).map(channel => channel);
                res.json({ channels });
            } else {
                res.json({ });
            }
        })

        this.app.post('/sendMessage', async (req, res) => {
            const token = req.body.token;
            const guildId = req.body.guild;
            const channelId = req.body.channel;
            const message = req.body.text;

            if (!token || !channelId || !guildId || !message) {
                return res.sendStatus(400);
            }

            if (!this.checkToken(token)) {
                return res.sendStatus(401);
            }

            const guild = this.client.guilds.cache.get(guildId);
            const channel = guild?.channels.cache.get(channelId) as TextChannel;

            if (channel) {
                await channel.sendTyping();
                await channel.send(message);
                res.sendStatus(200); 
            } else {
                res.sendStatus(406);
            }
        });
    }
    */

}
