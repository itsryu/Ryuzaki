import { Ryuzaki } from '../../RyuzakiClient';
import { RawListenerStructure, ClientEmbed } from '../../Structures';
import { TextChannel, GatewayDispatchEvents } from 'discord.js';

export default class rawMessageReactionAddListener extends RawListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: GatewayDispatchEvents.MessageReactionAdd
        });
    }

    async eventExecute(reaction: any) {
        const guild = await this.client.guilds.fetch(reaction.guild_id);
        const server = await this.client.getData(guild.id, 'guild');
        const starboard = server.starboard;

        //================================ Starboard System ================================//

        //=====---- Evento de Adicionar/Criar a Starboard ----====//

        try {
            if (starboard.status) {
                const channel = guild.channels.cache.get(reaction.channel_id) as TextChannel;
                const message = await channel.messages.fetch(reaction.message_id);
                const rc = message.reactions.cache.get('⭐');

                if (message.author.bot) return;

                if (rc && rc.count >= starboard.reactions) {
                    const handleStarboard = async () => {
                        const channel = guild.channels.cache.get(starboard.channel) as TextChannel;
                        const msgs = await channel.messages.fetch({ limit: 100 });
                        const existingMsg = msgs.find((msg) => msg.embeds.length === 1 ? msg.embeds[0].footer?.text === `ID: ${message.id}` ? true : false : false);

                        if (existingMsg) {
                            existingMsg.edit({ content: `${rc.count}・⭐` });
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

                            if (channel) {
                                channel.send({ content: `${rc.count}・⭐`, embeds: [embed] })
                                    .then((msg) => msg.react('⭐'));
                            }
                        }
                    };

                    if (reaction.emoji.name === '⭐') {
                        if (!(this.client.guilds.cache.get(reaction.guild_id)!).channels.cache.get(starboard.channel)) return;

                        if (message.partial) {
                            await reaction.fetch();
                            message;
                            await handleStarboard();
                        } else {
                            await handleStarboard();
                        }
                    }
                }

                //=====---- Evento de Remover/Deletar a Starboard ----====//

                const handleStarboard = async () => {
                    const channel = guild.channels.cache.get(starboard.channel) as TextChannel;
                    const msgs = await channel.messages.fetch({ limit: 100 });
                    const existingMsg = msgs.find((msg) => msg.embeds.length === 1 ? msg.embeds[0].footer?.text === `ID: ${message.id}` ? true : false : false);

                    if (existingMsg) {
                        if (!rc || rc.count < starboard.reactions) {
                            setTimeout(() => existingMsg.delete(), 2000);
                        } else {
                            existingMsg.edit({ content: `${rc.count}・⭐` });
                        }
                    }
                };

                if (reaction.emoji.name === '⭐') {
                    if (!(this.client.guilds.cache.get(reaction.guild_id)!).channels.cache.get(starboard.channel)) return;

                    if (message.partial) {
                        await reaction.fetch();
                        message;
                        await handleStarboard();
                    } else {
                        await handleStarboard();
                    }
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, rawMessageReactionAddListener.name);
            this.client.logger.warn((err as Error).stack!, rawMessageReactionAddListener.name);
        }
    }
}