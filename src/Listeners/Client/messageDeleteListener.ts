import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../Structures/';
import { Events, Message, TextChannel } from 'discord.js';
import { emojis } from '../../Utils/Objects/emojis';

export default class MessageDeleteListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.MessageDelete
        });
    }

    async eventExecute(message: Message) {
        if (!message.author || message.author.bot) return;

        try {
            const guild = message.guild;

            if (guild) {
                const server = await this.client.getData(guild.id, 'guild');

                if (server.logs.messages) {
                    const embed = new ClientEmbed(this.client)
                        .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 4096 }))
                        .setAuthor({ name: guild.name, iconURL: guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
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

                    if (server.logs.status) {
                        const channel = guild.channels.cache.get(server.logs.channel) as TextChannel;

                        channel.send({ embeds: [embed] });
                    }
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, MessageDeleteListener.name);
            this.client.logger.warn((err as Error).stack!, MessageDeleteListener.name);
        }
    }
}