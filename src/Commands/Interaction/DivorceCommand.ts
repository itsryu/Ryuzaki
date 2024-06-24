import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { DivorceCommandData } from '../../Data/Commands/Interaction/DivorceCommandData.js';
import { emojis } from '../../Utils/Objects/emojis';
import { Message, MessageReaction, User } from 'discord.js';


export default class DivorceCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, DivorceCommandData);
    }

    public async commandExecute({ message }: { message: Message }) {
        try {
            const userData = await this.client.getData(message.author.id, 'user');

            if (!userData) {
                return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {
                const singleEmbed = new ClientEmbed(this.client)
                    .setTitle(this.client.t('interaction:divorce:embeds:single.title', { emoji: emojis.ring }))
                    .setDescription(this.client.t('interaction:divorce:embeds:single.description', { emoji: '🤔', author: message.author }));

                if (!userData.marry.has) {
                    return void message.reply({ embeds: [singleEmbed] });
                } else {
                    const soul = await this.client.users.fetch(userData.marry.user).catch(() => undefined);

                    const wantDivorceEmbed = new ClientEmbed(this.client)
                        .setTitle(this.client.t('interaction:divorce:embeds:want.title', { emoji: emojis.ring }))
                        .setDescription(this.client.t('interaction:divorce:embeds:want.description', { soul: soul?.tag, author: message.author, firstTime: Math.floor(userData.marry.time / 1000), secondTime: Math.floor(userData.marry.time / 1000) }))
                        .setFooter({ text: this.client.t('interaction:divorce:embeds:want.footer') });

                    const msg = await message.reply({ embeds: [wantDivorceEmbed] });
                    await msg.react('✅');
                    await msg.react('❌');

                    const filter = (reaction: MessageReaction, user: User) => reaction.message.id === msg.id && user.id === message.author.id;
                    const collector = msg.createReactionCollector({ filter, time: 60000, max: 1 });

                    collector.on('end', async (collected) => {
                        if (collected.size === 0) {
                            const footer = { text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) };

                            msg.edit({ embeds: [wantDivorceEmbed.setFooter(footer)] });
                        }

                        await msg.reactions.removeAll();
                    });

                    collector.on('collect', async (r) => {
                        if (r.emoji.name == '✅') {
                            const targetData = await this.client.getData(userData.marry.user, 'user');

                            if (!targetData) {
                                return void msg.edit({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
                            } else {
                                const divorcedEmbed = new ClientEmbed(this.client)
                                    .setTitle(this.client.t('interaction:divorce:embeds:divorced.title', { emoji: emojis.ring }))
                                    .setDescription(this.client.t('interaction:divorce:embeds:divorced.description', { author: message.author }));

                                await userData.updateOne({
                                    $set: {
                                        'marry.user': null,
                                        'marry.has': false,
                                        'marry.time': 0
                                    }
                                }, { new: true });

                                await targetData.updateOne({
                                    $set: {
                                        'marry.user': null,
                                        'marry.has': false,
                                        'marry.time': 0
                                    }
                                }, { new: true });

                                return void msg.edit({ embeds: [divorcedEmbed] });
                            }
                        }

                        if (r.emoji.name == '❌') {
                            return void msg.edit({ content: this.client.t('interaction:divorce:errors.rejected', { user: soul, author: message.author }), embeds: [] });
                        }
                    });
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, DivorceCommand.name);
            this.client.logger.warn((err as Error).stack, DivorceCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}
