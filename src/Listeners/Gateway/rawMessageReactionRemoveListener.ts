import { Ryuzaki } from '../../ryuzakiClient';
import { RawListenerStructure, ClientEmbed } from '../../Structures';
import { TextChannel, GatewayDispatchEvents, GatewayMessageReactionRemoveDispatchData } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class RawMessageReactionRemoveListener extends RawListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: GatewayDispatchEvents.MessageReactionRemove
        });
    }

    async eventExecute(reaction: GatewayMessageReactionRemoveDispatchData) {
        if (reaction.guild_id) {
            const guild = await this.client.guilds.fetch(reaction.guild_id).catch(() => undefined);
            const guildData = await this.client.getData(guild?.id, 'guild');

            //================================ Starboard System ================================//

            //=====---- Evento de Adicionar/Criar a Starboard ----====//

            try {
                if (guild && guildData) {
                    const starboard = guildData.starboard;

                    if (starboard.status) {
                        const channel = guild.channels.cache.get(reaction.channel_id) as TextChannel;
                        const message = await channel.messages.fetch(reaction.message_id);
                        const rc = message.reactions.cache.get('⭐');

                        if (message.author.bot) return;

                        if (rc && rc.count >= starboard.reactions) {
                            const handleStarboard = async (channel: TextChannel) => {
                                const messages = await channel.messages.fetch({ limit: 100 });
                                const existingMsg = messages.find((msg) => msg.embeds.length === 1 ? msg.embeds[0].footer?.text === `ID: ${message.id}` ? true : false : false);

                                if (existingMsg) {
                                    await existingMsg.edit({ content: `${rc.count}・⭐` });
                                } else {
                                    const embed = new ClientEmbed(this.client)
                                        .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 4096 }))
                                        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                        .setDescription(`\n[Ir para a mensagem](${message.url})\n\n**Mensagem:**\n${message.content}`)
                                        .setFooter({ text: `ID: ${reaction.message_id}` });

                                    const image = message.attachments.first();

                                    if (image) {
                                        embed.setImage(image.proxyURL);
                                    }

                                    await channel.send({ content: `${rc.count}・⭐`, embeds: [embed] })
                                        .then((msg) => msg.react('⭐'));
                                }
                            };

                            if (reaction.emoji.name === '⭐') {
                                const channel = this.client.guilds.cache.get(reaction.guild_id)?.channels.cache.get(starboard.channel) as TextChannel | undefined;

                                if (channel) {
                                    await handleStarboard(channel);
                                }
                            }
                        }


                        //=====---- Evento de Remover/Deletar a Starboard ----====//

                        const handleStarboard = async (channel: TextChannel) => {
                            const messages = await channel.messages.fetch({ limit: 100 });
                            const existingMsg = messages.find((msg) => msg.embeds.length === 1 ? msg.embeds[0].footer?.text === `ID: ${message.id}` ? true : false : false);

                            if (existingMsg) {
                                if (!rc || rc.count < starboard.reactions) {
                                    setTimeout(() => existingMsg.delete(), 2000);
                                } else {
                                    await existingMsg.edit({ content: `${rc.count}・⭐` });
                                }
                            }
                        };

                        if (reaction.emoji.name === '⭐') {
                            const channel = this.client.guilds.cache.get(reaction.guild_id)?.channels.cache.get(starboard.channel) as TextChannel | undefined;

                            if (channel) {
                                await handleStarboard(channel);
                            }
                        }
                    }
                }
            } catch (err) {
                Logger.error((err as Error).message, RawMessageReactionRemoveListener.name);
                Logger.warn((err as Error).stack, RawMessageReactionRemoveListener.name);
            }
        }
    }
}