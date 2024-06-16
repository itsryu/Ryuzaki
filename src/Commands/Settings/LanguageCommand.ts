import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { Message, ActionRowBuilder, StringSelectMenuBuilder, MessageComponentInteraction, StringSelectMenuInteraction } from 'discord.js';
import { LanguageCommandData } from '../../Data/Commands/Settings/LanguageCommandData';
import { Languages } from '../../Types/ClientTypes';

export default class languageCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, LanguageCommandData);
    }

    async commandExecute({ message, args, language }: { message: Message, args: string[], language: Languages }) {
        const guildLang = args[0];
        const guild = await this.client.getData(message.guild?.id, 'guild');

        const languages = {
            'pt-BR': {
                id: 1,
                name: 'pt-BR 🇧🇷',
                complete: 100
            },
            'en-US': {
                id: 2,
                name: 'en-US 🇺🇸',
                complete: 90
            }
        };

        if (guildLang) {
            switch (guildLang) {
                case 'pt-BR': {
                    if (guildLang === guild.lang) {
                        return void message.reply(this.client.t('config:language:responses.filter_currently'));
                    } else {
                        await guild.updateOne({ $set: { lang: guildLang } }, { new: true });

                        return void message.reply({ content: this.client.t('config:language.responses:success') });
                    }
                }
                case 'en-US': {
                    if (guildLang === guild.lang) {
                        return void message.reply(this.client.t('config:language:responses.filter_currently'));
                    } else {
                        await guild.updateOne({ $set: { lang: guildLang } }, { new: true });

                        return void message.reply({ content: this.client.t('config:language.responses:success') });
                    }
                }
                default: {
                    return void message.reply({ content: this.client.t('config:language.responses.none') });
                }
            }
        } else {
            const embed = new ClientEmbed(this.client)
                .setTitle(this.client.t('config:language.title'))
                .setDescription(`${Object.entries(languages).map(([, lang], index) => `**${index + 1}** - ${lang.name}`).join('\n')}\n\n${this.client.t('config:language.currently')} \`${language}\``);

            const categories = Object.entries(languages).map(([key, value]) => ({ key, ...value }));

            const menu = new StringSelectMenuBuilder()
                .setCustomId('languages')
                .setPlaceholder(this.client.t('config:language:menu.place'))
                .addOptions([
                    {
                        label: this.client.t('config:language:menu.label'),
                        description: this.client.t('config:language:menu.description', { index: 0 }),
                        emoji: '⬅️',
                        value: 'cancel'
                    }
                ]);

            categories.forEach((x) => {
                menu.addOptions([
                    {
                        label: x.name.split(' ')[0],
                        description: this.client.t('config:language:menu.description', { index: 1, language: x.name.split(' ')[0] }),
                        emoji: x.name.split(' ')[1],
                        value: x.key
                    }]
                );
            });

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
            const msg = await message.reply({ embeds: [embed], components: [row] });
            const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isStringSelectMenu() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('end', () => {
                menu.setDisabled(true);
                msg.edit({ embeds: [embed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })], components: [row] });
            });

            collector.on('collect', async (i: StringSelectMenuInteraction) => {
                if (i.values[0] === 'cancel') {
                    menu.setDisabled(true);
                    msg.edit({ components: [row] });
                    message.channel.send({ content: this.client.t('config:language:responses.cancel') });
                }

                if (i.values[0] === 'pt-BR') {
                    const id = i.values[0];

                    if (id === guild.lang) {
                        return void message.channel.send(this.client.t('config:language:responses.filter_currently'));
                    } else {
                        await guild.updateOne({ $set: { lang: id } }, { new: true });
                        const t = await this.client.getTranslate(message.guild?.id!);

                        embed.setTitle(t('config:language.title'));
                        embed.setDescription(`${Object.entries(languages).map(([, lang], index) => `**${index + 1}** - ${lang.name}`).join('\n')}\n\n${t('config:language.currently')} \`${i.values[0]}\``);

                        menu.setDisabled(true);
                        menu.setPlaceholder(t('config:language:menu.place'));

                        msg.edit({ embeds: [embed], components: [row] });
                        message.channel.send({ content: t('config:language:responses.success') });
                    }
                }

                if (i.values[0] === 'en-US') {
                    const id = i.values[0];

                    if (id === guild.lang) {
                        return void message.channel.send(this.client.t('config:language:responses.filter_currently'));
                    } else {
                        await guild.updateOne({ $set: { lang: id } }, { new: true });
                        const t = await this.client.getTranslate(message.guild?.id!);

                        embed.setTitle(t('config:language.title'));
                        embed.setDescription(`${Object.entries(languages).map(([, lang], index) => `**${index + 1}** - ${lang.name}`).join('\n')}\n\n${t('config:language.currently')} \`${i.values[0]}\``);

                        menu.setDisabled(true);
                        menu.setPlaceholder(t('config:language:menu.place'));

                        msg.edit({ embeds: [embed], components: [row] });
                        message.channel.send({ content: t('config:language:responses.success') });
                    }
                }
            });
        }
    }
}

