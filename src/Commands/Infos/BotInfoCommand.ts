import { Ryuzaki } from '../../RyuzakiClient';
import { emojis } from '../../Utils/Objects/emojis';
import { Languages } from '../../Types/ClientTypes';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { BotInfoCommandData } from '../../Data/Commands/Infos/BotInfoCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, version } from 'discord.js';
import { platform, arch } from 'node:os';
import Day from 'dayjs';
import { connection } from 'mongoose';
import { clientStats } from '../../Client';
import { CPU_CORES, CPU_MODEL, TOTAL_RAM } from '../../Utils/constants';
import { Bytes } from '../../Utils/bytes';
import { memoryUsage } from 'node:process';
import { Logger } from '../../Utils/logger';

export default class BotInfoCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, BotInfoCommandData);
    }

    async commandExecute({ message, prefix, language }: { message: Message, prefix: string, language: Languages }) {
        try {
            //===============> Importações <===============//

            const clientUsername = this.client.user?.username;
            const clientTag = this.client.user?.tag;
            const clientId = this.client.user?.id;
            const usersArray = await this.client.shard?.fetchClientValues('users.cache.size').catch(() => undefined) as number[] | undefined;
            const clientUsers = usersArray?.reduce((acc, userCount) => acc + userCount, 0);
            const guildsArray = await this.client.shard?.fetchClientValues('guilds.cache.size').catch(() => undefined) as number[] | undefined;
            const clientGuilds = guildsArray?.reduce((acc, guildCount) => acc + guildCount, 0);
            const clientCommands = this.client.commands.size;
            const clientUptime = Day.duration(process.uptime() * 1000).locale(language).humanize();
            const clientMemory = new Bytes(process.memoryUsage().heapUsed);
            const clientPing = Math.floor(this.client.ws.ping);
            const djsVersion = version;
            const njsVersion = process.version;
            const clientOwner = await this.client.users.fetch(process.env.OWNER_ID);
            const clientAvatar = this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 });
            const dbPing = await BotInfoCommand.databasePing();

            //===============> Finalizações <===============//

            const clientInfo = new ClientEmbed(this.client)
                .setAuthor({ name: `Olá, me chamo ${clientUsername}!`, iconURL: clientAvatar })
                .setThumbnail(clientAvatar ?? null)
                .setDescription(`Olá, me chamo ${clientUsername}, sou um simples BOT para o Discord com a simples intenção de ajudar muitas pessoas em seus servidores.`)
                .addFields(
                    {
                        name: 'Sobre:',
                        value: `Nickname: \`${clientTag}\`\nID: \`${clientId}\`\nPrefixo neste servidor: \`${prefix}\``
                    },
                    {
                        name: 'Estatísticas:',
                        value: `💻 Plataforma: \`${platform()}\`\n🧮 Memória: \`${clientMemory}\`\n🏘️ Servidores: \`${clientGuilds}\`\n👥 Usuários: \`${clientUsers}\`\n🔧 Total de Comandos: \`${clientCommands}\`\n📀 Shard ID: \`${clientStats.shardId}\` \`(${clientStats.shardId + 1}/${clientStats.totalShards}\`)`
                    },
                    {
                        name: 'Linguagem e outros:',
                        value: `🈯 Linguagem: [Typescript](https://www.typescriptlang.org) \n📚 Biblioteca: [Discord.js](https://discord.js.org/docs/packages/discord.js/${version}) \`(v${djsVersion})\`\n🌲 Ambiente: [Node.js](https://nodejs.org/) \`(${njsVersion})\`\n🏦 Banco de dados: [MongoDB](https://www.mongodb.com/)`
                    },
                    {
                        name: 'Sistema:',
                        value: `CPU: \`${CPU_MODEL} (${CPU_CORES} cores)\`\nRAM: \`${new Bytes(memoryUsage().heapUsed)}/${new Bytes(TOTAL_RAM)}\`🛠️ Arquitetura: \`${arch()}\`\n⏰ Tempo online: \`${clientUptime}\`\n🛰 Ping do Host: \`${clientPing}\`ms\n🍃 Ping do DB: \`${dbPing}\`ms`
                    })
                .setFooter({ text: `${this.client.user?.username} criado pelo ${clientOwner.tag}`, iconURL: clientOwner.displayAvatarURL({ extension: 'png', size: 4096 }) });

            const addMeButton = new ButtonBuilder()
                .setURL(this.client.getInvite())
                .setStyle(ButtonStyle.Link)
                .setEmoji(emojis.pin)
                .setLabel(this.client.t('main:mentions:button.add'));

            const githubButton = new ButtonBuilder()
                .setURL('https://github.com/itsryu/Ryuzaki')
                .setStyle(ButtonStyle.Link)
                .setEmoji(emojis.github)
                .setLabel(this.client.t('main:mentions:button.github'));

            const voteButton = new ButtonBuilder()
                .setURL('https://top.gg/bot/1117629775046004766/vote')
                .setStyle(ButtonStyle.Link)
                .setEmoji('🚀')
                .setLabel(this.client.t('main:mentions:button.vote'));

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents([addMeButton, githubButton, voteButton]);
            return void await message.reply({ embeds: [clientInfo], components: [row] });
        } catch (err) {
            Logger.error((err as Error).message, BotInfoCommand.name);
            Logger.warn((err as Error).stack, BotInfoCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }

    private static async databasePing() {
        const dbStart = process.hrtime();
        await connection.db.command({ ping: 1 });
        const dbStop = process.hrtime(dbStart);

        return Math.round((dbStop[0] * 1e9 + dbStop[1]) / 1e6);
    }
}