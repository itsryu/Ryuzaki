import { Client, Collection, PermissionFlagsBits, OAuth2Scopes, Snowflake, Invite, ClientOptions, REST } from 'discord.js';
import { ClientModel, CommandModel, GuildModel, UserModel } from './Database/index';
import { Logger } from './Utils/logger';
import { Translate } from '../lib/Translate';
import { Api } from '@top-gg/sdk';
import { CommandStructure, ContextCommandStructure, ServiceStructure } from './Structures';
import { Collections } from './Utils/collection';
import { DataType, Languages, DataDocument, ShardMemory } from './Types/ClientTypes';
import { config } from 'dotenv';
import { join } from 'node:path';

config({ path: join(__dirname, '../.env') });

export class Ryuzaki extends Client {
    public readonly rest: REST = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);
    public readonly stats: Api = new Api(process.env.DBL_TOKEN);
    public readonly collection = new Collections<string>();
    public readonly developers: readonly string[] = Object.freeze([process.env.OWNER_ID]);
    public readonly commands = new Collection<string, CommandStructure>();
    public readonly contexts = new Collection<string, ContextCommandStructure>();
    public readonly cooldowns = new Collection<string, Collection<Snowflake, number>>();
    public readonly services = new Collection<string, ServiceStructure>();
    public readonly invites = new Collection<string, Collection<string, Invite>>();
    public readonly translate: Translate = new Translate(process.env.LANG_PATH);
    public t!: typeof this.translate.t;
    public url!: string;
    public static readonly database: {
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

    public constructor(options: ClientOptions) {
        super(options);

        process.on('warning', (warn) => { Logger.warn(warn.stack, 'warning'); });
        process.on('uncaughtException', (err: Error) => { Logger.error(err.stack, 'uncaughtException'); });
        process.on('unhandledRejection', (err: Error) => { Logger.error(err.stack, 'unhandledRejection'); });
    }

    public async initialize() {
        try {
            await this.clientManager();
            await this.registerSlashCommands();
        } catch (err) {
            Logger.error((err as Error).message, [Ryuzaki.name, this.initialize.name]);
            Logger.warn((err as Error).stack, [Ryuzaki.name, this.initialize.name]);
        }
    }

    private async clientManager() {
        const { default: servicesIndex } = await import('./Services/index');
        await new servicesIndex(this).moduleExecute();
    }

    protected async registerSlashCommands() {
        const { default: registerSlash } = await import('../RegisterSlashCommands');
        return new registerSlash(this).moduleExecute();
    }

    public get getInvite(): string {
        return this.generateInvite({
            permissions: [
                PermissionFlagsBits.ManageGuild,
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ManageNicknames,
                PermissionFlagsBits.KickMembers,
                PermissionFlagsBits.BanMembers,
                PermissionFlagsBits.CreateInstantInvite,
                PermissionFlagsBits.ManageGuildExpressions,
                PermissionFlagsBits.ManageWebhooks,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ModerateMembers,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.UseExternalEmojis,
                PermissionFlagsBits.AddReactions,
                PermissionFlagsBits.UseApplicationCommands
            ],
            scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands]
        });
    }

    public async getLanguage(id: string): Promise<Languages> {
        const guild = this.guilds.cache.get(id);
        const user = guild ? null : await this.users.fetch(id).catch(() => undefined);

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
                    const user = await this.users.fetch(id).catch(() => undefined);

                    if (user) {
                        let data = await Ryuzaki.database.users.findOne({ _id: user.id });

                        try {
                            if (!data) {
                                data = await Ryuzaki.database.users.create({ _id: user.id });
                            }

                            return data as DataDocument<T>;
                        } catch (err) {
                            Logger.error((err as Error).message, [Ryuzaki.name, this.getData.name]);
                            Logger.warn((err as Error).stack, [Ryuzaki.name, this.getData.name]);
                        }
                    } else {
                        return undefined;
                    }
                }

                break;
            }

            case 'guild': {
                if (id) {
                    const guild = await this.guilds.fetch(id).catch(() => undefined);

                    if (guild) {
                        try {
                            let data = await Ryuzaki.database.guilds.findOne({ _id: guild.id });

                            if (!data) {
                                data = await Ryuzaki.database.guilds.create({ _id: guild.id });
                            }

                            return data as DataDocument<T>;
                        } catch (err) {
                            Logger.error((err as Error).message, [Ryuzaki.name, this.getData.name]);
                            Logger.warn((err as Error).stack, [Ryuzaki.name, this.getData.name]);
                        }
                    } else {
                        return undefined;
                    }
                }

                break;
            }

            case 'client': {
                if (id) {
                    const user = await this.users.fetch(id).catch(() => undefined);

                    if (user && user.id === id) {
                        try {
                            let data = await Ryuzaki.database.client.findOne({ _id: user.id });

                            if (!data) {
                                data = await Ryuzaki.database.client.create({ _id: user.id });
                            }

                            return data as DataDocument<T>;
                        } catch (err) {
                            Logger.error((err as Error).message, [Ryuzaki.name, this.getData.name]);
                            Logger.warn((err as Error).stack, [Ryuzaki.name, this.getData.name]);
                        }
                    } else {
                        return undefined;
                    }
                }

                break;
            }

            case 'command': {
                if (id) {
                    const command = this.commands.get(id);

                    if (command) {
                        try {
                            let data = await Ryuzaki.database.commands.findOne({ _id: id });

                            if (!data) {
                                data = await Ryuzaki.database.commands.create({ _id: id });

                                console.log(`The command: (${data._id}) had his documentation create successfully!`);
                            }

                            return data as DataDocument<T>;
                        } catch (err) {
                            Logger.error((err as Error).message, [Ryuzaki.name, this.getData.name]);
                            Logger.warn((err as Error).stack, [Ryuzaki.name, this.getData.name]);
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

    public async getMemoryUsage() {
        const shardsCount = this.shard?.count ?? 0;
        const shardMemoryPromises = this.shard?.broadcastEval(() => process.memoryUsage().heapUsed) ?? [];
        const shardGuildsPromises = this.shard?.broadcastEval((client: Client) => client.guilds.cache.map(guild => guild.id)) ?? [];
        const [shardMemoryValues, shardGuildsValues] = await Promise.all([shardMemoryPromises, shardGuildsPromises]);

        const memoryUsage: ShardMemory = {
            totalMemory: shardMemoryValues.reduce((total, shardMemory) => total + shardMemory, 0) / 1024 / 1024,
            shards: {}
        };

        for (let shardId = 0; shardId < shardsCount; shardId++) {
            const shardMemory = shardMemoryValues[shardId] / 1024 / 1024;
            const shardGuilds = shardGuildsValues[shardId];

            memoryUsage.shards[shardId] = {
                shardMemory,
                servers: new Collection<string, { memory: number }>()
            };

            const avgMemoryPerGuild = shardMemory / shardGuilds.length;

            for (const guildId of shardGuilds) {
                memoryUsage.shards[shardId].servers.set(guildId, { memory: avgMemoryPerGuild });
            }
        }

        return memoryUsage;
    }
}