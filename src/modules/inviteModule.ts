import { ModuleStructure } from '../structures';
import { ChannelType, Message, PermissionFlagsBits } from 'discord.js';
import { Logger } from '../utils';

export default class InviteModule extends ModuleStructure {
    async moduleExecute(message: Message) {
        try {
            if (message.guild && message.channel.type === ChannelType.GuildText) {
                const guildData = await this.client.getData(message.guild.id, 'guild');

                if (guildData && guildData.antinvite.status && message.guild.members.me && message.channel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.ManageGuild)) {
                    const regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|(discord|discordapp)\.com\/invite)\/.+[a-z]/g;
                    const invites = await message.guild.invites.fetch();
                    const filter = invites.filter(i => i.inviter);
                    const url = Array.from(filter.map(i => i.code));
                    const content = message.content.split('/');

                    if (regex.test(message.content)) {
                        if (!url.some((link) => content[content.length - 1] === link)) {
                            const channels = guildData.antinvite.channels.some((x) => x === message.channel.id);
                            const roles = guildData.antinvite.roles.some((x) => message.member?.roles.cache.has(x));

                            if (!message.member?.permissions.has(PermissionFlagsBits.Administrator) && !channels && !roles) {
                                await message.delete();
                                return void message.reply({ content: !guildData.antinvite.msg ? `${message.author}, convites para outros servidores sem permissão são estritamente proibidos.` : guildData.antinvite.msg.replace(/{user}/g, `<@${message.author.id}>`).replace(/{channel}/g, `<#${message.channel.id}>`).replace(/{guild}/g, message.guild.name) });
                            }
                        }
                    }
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, InviteModule.name);
            Logger.warn((err as Error).stack, InviteModule.name);
        }
    }
}