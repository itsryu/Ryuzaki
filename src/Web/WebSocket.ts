import { Ryuzaki } from '../RyuzakiClient';
import { ClientEmbed, CommandStructure, WebSocketStructure } from '../Structures';
import { resolve } from 'node:path';
import { Server } from 'node:http';
import express, { Express } from 'express';
import { TextChannel, Client, ChannelType, Guild, Collection } from 'discord.js';
import { Webhook } from '@top-gg/sdk';
import { engine } from 'express-handlebars';
import { urlencoded, json } from 'body-parser';

export default class WebSocket extends WebSocketStructure {
    private readonly app: Express = express();
    private server!: Server;
    private token!: string;

    constructor(client: Ryuzaki, token: string) {
        super(client);

        this.token = token;
        this.server;
    }

    async socketExecute(): Promise<void> {
        this.config();
        await this.listen();
        this.registerRoots();
    }

    private config(): void {
        this.app.engine('html', engine({
            extname: 'html',
            defaultLayout: 'layout',
            layoutsDir: resolve(__dirname, '..', '..', '..', 'src', 'Web', 'layouts')
        }));

        this.app.set('view engine', 'html');
        this.app.set('views', resolve(__dirname, '..', '..', '..', 'src', 'Web', 'views'));
        this.app.set('views', resolve(__dirname, '..', '..', '..', 'src', 'Web', 'views', 'commands'));
        this.app.use(express.static(resolve(__dirname, '..', '..', '..', 'src', 'Web', 'public')));
        this.app.use(urlencoded({ extended: true }));
        this.app.use(json());
    }

    private async listen(): Promise<Server> {
        const port = process.env.PORT || 3000;
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

                        this.client.logger.info('Updated stats on top.gg wesite.', 'Top.gg');
                    } catch (err) {
                        this.client.logger.error('Error while updating stats to top.gg website: ' + (err as Error).message, WebSocket.name);
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

    private checkToken(token: string): boolean {
        return (token == this.token);
    }

    private registerRoots(): void {
        const webhook = new Webhook(process.env.TOPGG_WH_AUTH);

        const guilds: Guild[] = [];
        this.client.guilds.cache.forEach(guild => {
            guilds.push(guild);
        });

        const commands = new Collection<string, CommandStructure>();
        this.client.commands.forEach(command => {
            commands.set(command.data.options.name, command);
        });

        this.app.post('/dblwebhook', webhook.listener(async (vote) => {
            const user = await this.client.users.fetch(vote.user).catch(() => undefined);
            const userData = await this.client.getData(user?.id, 'user');
            const addedMoney = this.client.utils.randomIntFromInterval(2000, 5000);
            const money = userData.economy.coins;
            const votes = userData.economy.votes;

            userData.set({
                'economy.coins': addedMoney + money,
                'economy.daily': Date.now(),
                'economy.votes': userData.economy.votes + 1,
                'economy.vote': Date.now()
            }).save();

            const votedEmbed = new ClientEmbed(this.client)
                .setAuthor({ name: this.client.t('main:vote:embeds:voted.title'), iconURL: user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                .setDescription(this.client.t('main:vote:embeds:voted.description', { user, votes, money: addedMoney.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), abbrevMoney: this.client.utils.toAbbrev(addedMoney) }));

            user?.send({ embeds: [votedEmbed] })
                .then((message) => message.react('🥰'))
                .catch();
        }));

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
}
