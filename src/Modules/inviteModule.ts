import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure } from '../Structures/';
import { ChannelType, Message, PermissionFlagsBits } from 'discord.js';

export default class inviteModule extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

    async moduleExecute(message: Message) {
        try {
            if (message.guild && message.channel.type === ChannelType.GuildText) {
                const guild = await this.client.getData(message.guild.id, 'guild');

                if (guild.antinvite.status && message.channel.permissionsFor(message.guild.members.me!).has(PermissionFlagsBits.ManageGuild)) {
                    const regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|(discord|discordapp)\.com\/invite)\/.+[a-z]/g;
                    const invites = await message.guild.invites.fetch();
                    const filter = invites.filter(i => i.inviter);
                    const url = Array.from(filter.map(i => i.code));
                    const content = message.content.split('/');

                    if (regex.test(message.content)) {
                        if (!url.some((link) => content[content.length - 1] === link)) {
                            const channels = guild.antinvite.channels.some((x) => x === message.channel.id);
                            const roles = guild.antinvite.roles.some((x) => message.member?.roles.cache.has(x));

                            if (!message.member?.permissions.has(PermissionFlagsBits.Administrator) && !channels && !roles) {
                                message.delete();
                                return void message.reply({ content: guild.antinvite.msg === null ? `${message.author}, convites para outros servidores sem permissão são estritamente proibidos.` : guild.antinvite.msg.replace(/{user}/g, `<@${message.author.id}>`).replace(/{channel}/g, `<#${message.channel.id}>`).replace(/{guild}/g, message.guild.name) });
                            }
                        }
                    }
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, inviteModule.name);
            this.client.logger.warn((err as Error).stack!, inviteModule.name);
        }
    }
}