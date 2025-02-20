import { Ryuzaki } from '../../ryuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../structures';
import { Events, Message, PartialMessage, TextChannel } from 'discord.js';
import { Logger } from '../../utils';

export default class MessageUpdateListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.MessageUpdate
        });
    }

    async eventExecute(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
        try {
            if (newMessage.guild && newMessage.author && !newMessage.author.bot) {
                const guildData = await this.client.getData(newMessage.guild.id, 'guild');

                if (guildData && guildData.logs.status && guildData.logs.messages) {
                    if (oldMessage.content === newMessage.content) return;

                    const embed = new ClientEmbed(this.client)
                        .setThumbnail(newMessage.author.displayAvatarURL({ extension: 'png', size: 4096 }))
                        .setAuthor({ name: `Mensagem editada - ${newMessage.guild.name}`, iconURL: newMessage.guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                        .addFields(
                            {
                                name: 'Autor:',
                                value: `${newMessage.author} \`(${newMessage.author.id})\``,
                                inline: true
                            },
                            {
                                name: 'Canal',
                                value: `${newMessage.channel}`,
                                inline: true
                            });

                    if (oldMessage.content ?? oldMessage.attachments.size >= 1) {
                        embed.addFields({ name: 'Mensagem Anterior:', value: !oldMessage.content ? oldMessage.attachments.first()?.proxyURL ?? 'Não disponível' : `\`${oldMessage.content}\`` });
                    }

                    if (newMessage.content ?? newMessage.attachments.size >= 1) {
                        embed.addFields({ name: 'Mensagem Posterior:', value: !newMessage.content ? newMessage.attachments.first()?.proxyURL ?? 'Não disponível' : `[${newMessage.content}](${newMessage.url})` });
                    }

                    const channel = newMessage.guild.channels.cache.get(guildData.logs.channel) as TextChannel;
                    await channel.send({ embeds: [embed] });
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, MessageUpdateListener.name);
            Logger.warn((err as Error).stack, MessageUpdateListener.name);
        }
    }
}