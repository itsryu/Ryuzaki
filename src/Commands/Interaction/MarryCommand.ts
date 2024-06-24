import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { MarryCommandData } from '../../Data/Commands/Interaction/MarryCommandData';
import { Message, MessageReaction, User } from 'discord.js';
import { emojis } from '../../Utils/Objects/emojis';

export default class MarryCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, MarryCommandData);
    }

    public async commandExecute({ message, args }: { message: Message, args: string[] }) {
        try {
            const user = message.mentions.users.first() ?? await this.client.users.fetch(args[0]).catch(() => undefined);
            const userData = await this.client.getData(message.author.id, 'user');

            if (!userData) {
                return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else if (!args.length) {
                const singleEmbed = new ClientEmbed(this.client)
                    .setTitle(this.client.t('interaction:marry:embeds:single.title', { emoji: emojis.ring }))
                    .setDescription(this.client.t('interaction:marry:embeds:single.description', { author: message.author }))
                    .setFooter({ text: this.client.t('interaction:marry:embeds:single.footer') });

                if (!userData.marry.has) {
                    return void message.reply({ embeds: [singleEmbed] });
                } else {
                    const soul = await this.client.users.fetch(userData.marry.user).catch(() => undefined);

                    if (soul) {
                        const infoEmbed = new ClientEmbed(this.client)
                            .setTitle(this.client.t('interaction:marry:embeds:info.title', { emoji: emojis.ring }))
                            .setDescription(this.client.t('interaction:marry:embeds:info.description', { soulmate: soul.tag, firstTime: Math.floor(userData.marry.time / 1000), secondTime: Math.floor(userData.marry.time / 1000) }));

                        return void message.reply({ embeds: [infoEmbed] });
                    }
                }
            } else {
                if (!user) {
                    return void message.reply({ content: this.client.t('interaction:marry:errors.noUser') });
                } else {
                    const targetData = await this.client.getData(user.id, 'user');

                    if (!targetData) {
                        return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
                    } else if (userData.marry.has) {
                        return void message.reply({ content: this.client.t('interaction:marry:errors.userAlreadyMarried') });
                    } else if (targetData.marry.has) {
                        return void message.reply({ content: this.client.t('interaction:marry:errors.targetAlreadyMarried') });
                    } else if (user.id === message.author.id) {
                        return void message.reply({ content: this.client.t('interaction:marry:errors.sameUser') });
                    } else if (user.bot) {
                        return void message.reply({ content: this.client.t('interaction:marry:errors.botUser') });
                    } else {
                        const wantMarryEmbed = new ClientEmbed(this.client)
                            .setTitle(this.client.t('interaction:marry:embeds:want.title', { emoji: emojis.ring }))
                            .setDescription(this.client.t('interaction:marry:embeds:want.description', { user, author: message.author }))
                            .setFooter({ text: this.client.t('interaction:marry:embeds:want.footer') });

                        const msg = await message.reply({ embeds: [wantMarryEmbed] });
                        await msg.react('💍');
                        await msg.react('❌');

                        const filter = (r: MessageReaction, u: User) => r.message.id === msg.id && u.id === user.id;
                        const collector = msg.createReactionCollector({ filter, time: 60000, max: 1 });

                        collector.on('end', async (collected) => {
                            if (collected.size === 0) {
                                wantMarryEmbed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });

                                msg.edit({ embeds: [wantMarryEmbed] });
                            }
                            await msg.reactions.removeAll();
                        });

                        collector.on('collect', async (reaction: MessageReaction) => {
                            if (reaction.emoji.name === '💍') {
                                const marriedEmbed = new ClientEmbed(this.client)
                                    .setTitle(this.client.t('interaction:marry:embeds:married.title', { emoji: emojis.ring }))
                                    .setDescription(this.client.t('interaction:marry:embeds:married.description', { user, author: message.author }));

                                await userData.updateOne({
                                    $set: {
                                        'marry.user': user.id,
                                        'marry.has': true,
                                        'marry.time': Date.now()
                                    }
                                }, { new: true });

                                await targetData.updateOne({
                                    $set: {
                                        'marry.user': message.author.id,
                                        'marry.has': true,
                                        'marry.time': Date.now()
                                    }
                                }, { new: true });

                                return void msg.edit({ embeds: [marriedEmbed] });
                            }

                            if (reaction.emoji.name === '❌') {
                                return void msg.edit({ content: this.client.t('interaction:marry:errors.rejected', { user, author: message.author }), embeds: [] });
                            }
                        });
                    }
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, MarryCommand.name);
            this.client.logger.warn((err as Error).stack, MarryCommand.name);
        }
    }
}