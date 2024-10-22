import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { PrefixCommandData } from '../../data/commands/Settings/PrefixCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageComponentInteraction, ButtonInteraction, OmitPartialGroupDMChannel } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class PrefixCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, PrefixCommandData);
    }

    async commandExecute({ message, prefix }: { message: OmitPartialGroupDMChannel<Message>, prefix: string }) {
        try {
            const guildData = await this.client.getData(message.guild?.id, 'guild');
            const userData = await this.client.getData(message.author.id, 'user');
            const data = guildData ?? userData;

            if (!data) {
                return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {
                const embed = new ClientEmbed(this.client)
                    .addFields(
                        {
                            name: this.client.t('config:prefix:embeds.title'),
                            value: `***\`${prefix}\`***`
                        });

                const novo = new ButtonBuilder()
                    .setCustomId('new')
                    .setEmoji('🔧')
                    .setLabel(this.client.t('config:prefix:row.new'))
                    .setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(novo);
                const msg = await message.reply({ embeds: [embed], components: [row] });
                const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('end', async () => {
                    novo.setDisabled(true);
                    embed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });

                    await msg.edit({ embeds: [embed], components: [row] });
                });

                collector.on('collect', async (interaction: ButtonInteraction) => {
                    if (interaction.customId == 'new' && message.channel) {
                        await message.channel.send({ content: this.client.t('config:prefix.new') });

                        const filter = (msg: Message) => msg.author.id === message.author.id;
                        const col = await message.channel.awaitMessages({ filter, max: 1 });

                        if (col) {
                            const collected = col.first();

                            if (collected) {
                                if (['cancelar, cancel'].includes(collected.content)) {
                                    return void await message.channel.send({ content: this.client.t('config:prefix:errors.cancel') });
                                } else if (collected.content.length > 5) {
                                    return void await message.channel.send({ content: this.client.t('config:prefix:errors.length') });
                                } else if (collected.content === data.prefix) {
                                    return void await message.channel.send({ content: this.client.t('config:prefix:errors.same') });
                                } else {
                                    await data.updateOne({ $set: { prefix: collected.content } }, { new: true });

                                    novo.setDisabled(true);
                                    embed.setFields({ name: this.client.t('config:prefix:embeds.title'), value: `***\`${collected.content}\`***` });

                                    await msg.edit({ embeds: [embed], components: [row] });
                                    return void await message.channel.send({ content: this.client.t('config:prefix.success', { content: collected.content }) });
                                }
                            }
                        }
                    }
                });
            }
        } catch (err) {
            Logger.error((err as Error).message, PrefixCommand.name);
            Logger.warn((err as Error).stack, PrefixCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}