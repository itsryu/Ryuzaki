import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { PrefixCommandData } from '../../Data/Commands/Settings/PrefixCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageComponentInteraction, ButtonInteraction } from 'discord.js';

export default class prefixCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, PrefixCommandData);
    }

    async commandExecute({ message, prefix }: { message: Message, prefix: string }) {
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

            collector.on('end', () => {
                novo.setDisabled(true);
                embed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });

                msg.edit({ embeds: [embed], components: [row] });
            });

            collector.on('collect', async (i: ButtonInteraction) => {
                if (i.customId == 'new') {
                    message.channel.send({ content: this.client.t('config:prefix.new') });

                    const filter = (msg: Message) => msg.author.id === message.author.id;
                    const col = await i.channel?.awaitMessages({ filter, max: 1 });

                    if (col) {
                        const collected = col.first();

                        if (collected) {
                            if (['cancelar, cancel'].includes(collected.content)) {
                                return void message.channel.send({ content: this.client.t('config:prefix:errors.cancel') });
                            } else if (collected.content.length > 5) {
                                return void message.channel.send({ content: this.client.t('config:prefix:errors.length') });
                            } else if (collected.content === data.prefix) {
                                return void message.channel.send({ content: this.client.t('config:prefix:errors.same') });
                            } else {
                                await data.updateOne({ $set: { prefix: collected.content } }, { new: true });

                                novo.setDisabled(true);
                                embed.setFields({ name: this.client.t('config:prefix:embeds.title'), value: `***\`${collected.content}\`***` });

                                msg.edit({ embeds: [embed], components: [row] });
                                return void message.channel.send({ content: this.client.t('config:prefix.success', { content: collected.content }) });
                            }
                        }
                    }
                }
            });
        }
    }
}