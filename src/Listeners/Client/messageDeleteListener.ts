import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../Structures/';
import { Events, Message, PartialMessage, TextChannel } from 'discord.js';
import { emojis } from '../../Utils/Objects/emojis';

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

                if (guildData.logs.status && guildData.logs.messages) {
                    const embed = new ClientEmbed(this.client)
                        .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 4096 }))
                        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                        .setTitle('Mensagem deletada')
                        .addFields(
                            {
                                name: `${emojis.membro} Autor:`,
                                value: `\`${message.author.tag}\``,
                                inline: true
                            },
                            {
                                name: `${emojis.id} ID:`,
                                value: `\`${message.author.id}\``,
                                inline: true
                            },
                            {
                                name: ':infinity: Canal:',
                                value: `${message.channel}`
                            });

                    if (message.content) {
                        embed.addFields({ name: ':scroll: Contéudo da Mensagem:', value: `\`${message.content}\`` });
                    }

                    if (message.attachments.size >= 1) {
                        embed.addFields({ name: ':scroll: Contéudo da Mensagem:', value: message.attachments.first()?.proxyURL ?? 'Não disponível' });
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