import { Ryuzaki } from '../../RyuzakiClient';
import { emojis } from '../../Utils/Objects/emojis';
import { Languages } from '../../Types/ClientTypes';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { BotInfoCommandData } from '../../Data/Commands/Infos/BotInfoCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, version } from 'discord.js';
import { platform, cpus, arch } from 'node:os';
import Day from 'dayjs';
import { connection } from 'mongoose';


export default class ryuCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, BotInfoCommandData);
    }

    async commandExecute({ message, prefix, language }: { message: Message, prefix: string, language: Languages }) {
        //===============> Importações <===============//

        const clientUsername = this.client.user?.username;
        const clientTag = this.client.user?.tag;
        const clientId = this.client.user?.id;
        const usersArray = await this.client.shard?.fetchClientValues('users.cache.size').catch(() => undefined) as number[] | undefined ;
        const clientUsers = usersArray?.reduce((acc, userCount) => acc + userCount, 0);
        const guildsArray = await this.client.shard?.fetchClientValues('guilds.cache.size').catch(() => undefined) as number[] | undefined ;
        const clientGuilds = guildsArray?.reduce((acc, guildCount) => acc + guildCount, 0);
        const clientShards = this.client.shard?.ids.length;
        const clientCommands = this.client.commands.size;
        const clientUptime = Day.duration(process.uptime() * 1000).locale(language).humanize();
        const clientMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'MB';
        const clientPing = Math.floor(this.client.ws.ping) + 'ms';
        const djsVersion = version;
        const njsVersion = process.version;
        const inviteURL = this.client.loadInvite();
        const clientOwner = await this.client.users.fetch(process.env.OWNER_ID);
        const clientAvatar = this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 });
        const dbPing = await this.databasePing();

        //===============> Finalizações <===============//

        const clientInfo = new ClientEmbed(this.client)
            .setAuthor({ name: `Olá, me chamo ${clientUsername}!`, iconURL: clientAvatar })
            .setThumbnail(clientAvatar ?? null)
            .setDescription(`Olá, me chamo ${clientUsername}, sou um simples BOT para o Discord com a simples intenção de ajudar muitas pessoas em seus servidores.`)
            .addFields(
                {
                    name: 'Sobre:',
                    value: `<:info:900050287199399946> Nickname: \`${clientTag}\`\n:id: ID: \`${clientId}\`\n❓ Prefixo neste servidor: \`${prefix}\``
                },
                {
                    name: 'Estatísticas:',
                    value: `💻 Plataforma: \`${platform()}\`\n🧮 Memória: \`${clientMemory}\`\n🏘️ Servidores: \`${clientGuilds}\`\n👥 Usuários: \`${clientUsers}\`\n🔧 Total de Comandos: \`${clientCommands}\`\n📀 Shards totais: \`${clientShards}\``
                },
                {
                    name: 'Linguagem e outros:',
                    value: `🈯 Linguagem: [Typescript](https://www.typescriptlang.org) \n📚 Biblioteca: [Discord.js](https://discord.js.org) \`(v${djsVersion})\`\n🌲 Ambiente: [Node.js](https://nodejs.org/) \`(${njsVersion})\`\n🏦 Banco de dados: [MongoDB](https://www.mongodb.com/)`
                },
                {
                    name: 'Sistema:',
                    value: `🤖 CPU: \`\`\`md\n${cpus().map(i => `${i.model}`)[0]}\`\`\`\n🛠️ Arquitetura: \`${arch()}\`\n⏰ Tempo online: \`${clientUptime}\`\n🛰 Ping do Host: \`${clientPing}\`\n🍃 Ping do DB: \`${dbPing}\``
                })
            .setFooter({ text: `${clientTag} criado pelo ${clientOwner.tag}`, iconURL: clientOwner.displayAvatarURL({ extension: 'png', size: 4096 }) });

        const button = new ButtonBuilder()
            .setLabel('Me Adicione!')
            .setStyle(ButtonStyle.Link)
            .setURL(inviteURL)
            .setEmoji(emojis.pin);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        return void message.reply({ embeds: [clientInfo], components: [row] });
    }

    private async databasePing() {
        const dbStart = process.hrtime();
        await connection.db.command({ ping: 1 });
        const dbStop = process.hrtime(dbStart);

        return Math.round((dbStop[0] * 1e9 + dbStop[1]) / 1e6) + 'ms';
    }
}