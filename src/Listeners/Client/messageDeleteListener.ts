import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../Structures/';
import { Events, Message, PartialMessage, TextChannel } from 'discord.js';

export default class MessageDeleteListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.MessageDelete
        });
    }

    async eventExecute(message: Message | PartialMessage) {
        if (!message.author || message.author.bot) return;

        try {
            if (message.guild) {
                const guildData = await this.client.getData(message.guild.id, 'guild');

                if (guildData && guildData.logs.status && guildData.logs.messages) {
                    const embed = new ClientEmbed(this.client)
                        .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 4096 }))
                        .setAuthor({ name: `Mensagem deletada - ${message.guild.name}`, iconURL: message.guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                        .addFields(
                            {
                                name: 'Autor:',
                                value: `${message.author} \`(${message.author.id})\``,
                                inline: true
                            },
                            {
                                name: 'Canal:',
                                value: `${message.channel}`,
                                inline: true
                            });

                    if (message.content) {
                        embed.addFields({ name: 'Contéudo da mensagem:', value: `\`${message.content}\``, inline: false });
                    }

                    if (message.attachments.size >= 1) {
                        const URLs = message.attachments.map(attachment => attachment.proxyURL).join('\n');
                        embed.addFields({ name: 'Anexos:', value: URLs, inline: false });
                    }

                    const channel = message.guild.channels.cache.get(guildData.logs.channel) as TextChannel;
                    channel.send({ embeds: [embed] });
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, MessageDeleteListener.name);
            this.client.logger.warn((err as Error).stack!, MessageDeleteListener.name);
        }
    }
}