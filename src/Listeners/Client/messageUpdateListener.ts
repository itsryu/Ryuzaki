import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../Structures/';
import { Events, Message, TextChannel } from 'discord.js';
import { emojis } from '../../Utils/Objects/emojis';

export default class messageUpdateListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.MessageUpdate
        });
    }

    async eventExecute(oldMessage: Message, newMessage: Message) {
        if (newMessage && newMessage.author.bot) return;

        try {
            const guild = newMessage.guild;

            if (guild) {
                const server = await this.client.getData(guild.id, 'guild');

                if (server.logs.messages) {
                    if (oldMessage.content === newMessage.content) return;

                    const embed = new ClientEmbed(this.client)
                        .setThumbnail(newMessage.author.displayAvatarURL({ extension: 'png', size: 4096 }))
                        .setAuthor({ name: guild.name, iconURL: guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                        .setTitle('Mensagem editada')
                        .addFields(
                            {
                                name: `${emojis.membro} Autor:`,
                                value: `\`${newMessage.author.tag}\``,
                                inline: true
                            },
                            {
                                name: `${emojis.id} ID:`,
                                value: `\`${newMessage.author.id}\``,
                                inline: true
                            },
                            {
                                name: ':infinity: Canal',
                                value: `${newMessage.channel}`
                            });

                    if (oldMessage.content || oldMessage.attachments.size >= 1) {
                        embed.addFields({ name: 'Mensagem Anterior:', value: !oldMessage.content ? oldMessage.attachments.first()?.proxyURL ?? 'Não disponível' : `\`${oldMessage.content}\`` });
                    }

                    if (newMessage.content || newMessage.attachments.size >= 1) {
                        embed.addFields({ name: 'Mensagem Posterior:', value: !newMessage.content ? newMessage.attachments.first()?.proxyURL ?? 'Não disponível' : `\`${newMessage.content}\`` });
                    }

                    if (server.logs.status) {
                        const channel = guild.channels.cache.get(server.logs.channel) as TextChannel;
                        channel.send({ embeds: [embed] });
                    }
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, messageUpdateListener.name);
            this.client.logger.warn((err as Error).stack!, messageUpdateListener.name);
        }
    }
}