import { Client, Collection, PermissionFlagsBits, OAuth2Scopes, ClientOptions, Snowflake, Invite } from 'discord.js';
import { ClientModel, CommandModel, GuildModel, UserModel } from './Database/index';
import { Util, Logger } from './Utils/util';
import { Translate } from '../Lib/Translate';
import { Api } from '@top-gg/sdk';
import { CommandStructure, ContextCommandStructure, ServiceStructure } from './Structures';
import { Collections } from './Utils/collection';
import { DataType, Languages, DataDocument } from './Types/ClientTypes';
import { MongoError } from 'mongodb';

export class Ryuzaki extends Client {
    public readonly logger: Logger = new Logger();
    public readonly utils: Util = new Util();
    public readonly stats: Api = new Api(process.env.TOPGG_TOKEN);
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

    public constructor(options: ClientOptions) {
        super(options);
    }

    public async initialize() {
        await this.clientManager();
        await super.login(process.env.CLIENT_TOKEN);
        this.loadInvite();
        this.registerSlashCommands();
        this.loadWS();

        process.on('uncaughtException', (err: Error) => { this.logger.error((err).stack!, 'uncaughtException'); });
        process.on('unhandledRejection', (err: Error) => { this.logger.error((err).stack!, 'unhandledRejection'); });
    }

    private async clientManager() {
        const { default: servicesIndex } = await import('./Services/index');
        new servicesIndex(this).moduleExecute();
    }

    private async loadWS() {
        const { default: WebSocket } = await import('./Web/WebSocket');
        await new WebSocket(this, process.env.WS_PW).socketExecute();
    }

    private async registerSlashCommands() {
        const { default: registerSlash } = await import('../registerSlash');
        return new registerSlash(this).registerSlash();
    }

    public loadInvite() {
        return this.url = this.generateInvite({
            permissions: [
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.KickMembers,
                PermissionFlagsBits.BanMembers,
                PermissionFlagsBits.CreateInstantInvite,
                PermissionFlagsBits.ManageGuildExpressions,
                PermissionFlagsBits.ManageWebhooks,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ModerateMembers,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ManageNicknames,
                PermissionFlagsBits.ManageGuild,
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
        const guildData = await this.getData(guild?.id, 'guild');
        const languages: Languages[] = ['pt-BR', 'en-US'];

        guildData.updateOne({ $set: { lang: languages.some((lang) => lang === guild?.preferredLocale) ? guild?.preferredLocale : 'en-US' } }, { new: true });

        return guildData.lang as Languages;
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
    ): Promise<DataDocument<T>> {
        switch (type) {
            case 'user': {
                let data = await this.database.users.findOne({ _id: id });

                try {
                    if (!data) {
                        data = await this.database.users.create({ _id: id });
                    }

                    return data as any;
                } catch (err) {
                    if ((err as MongoError).code === 11000) {
                        this.logger.error(err as string, 'getData');
                    } else {
                        this.logger.error((err as Error).stack!, 'getData');
                    }
                }
            }
            case 'guild': {
                try {
                    let data = await this.database.guilds.findOne({ _id: id });

                    if (!data) {
                        data = await this.database.guilds.create({ _id: id });
                    }

                    return data as any;
                } catch (err) {
                    this.logger.error((err as Error).stack!, 'getData');
                }
            }
            case 'client': {
                try {
                    let data = await this.database.client.findOne({ _id: id });

                    if (!data) {
                        data = await this.database.client.create({ _id: id });
                    }

                    return data as any;
                } catch (err) {
                    this.logger.error((err as Error).stack!, 'getData');
                }
            }
            case 'command': {
                try {
                    let data = await this.database.commands.findOne({ _id: id });

                    if (!data) {
                        data = await this.database.commands.create({ _id: id });

                        console.log(`The command: (${data._id}) had his documentation create successfully!`);
                    }

                    return data as any;
                } catch (err) {
                    this.logger.error((err as Error).stack!, 'getData');
                }
            }
            default: {
                return {} as any;
            }
        }
    }
}