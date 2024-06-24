import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { Message, ActionRowBuilder, StringSelectMenuBuilder, MessageComponentInteraction, StringSelectMenuInteraction } from 'discord.js';
import { LanguageCommandData } from '../../Data/Commands/Settings/LanguageCommandData';
import { Languages } from '../../Types/ClientTypes';

interface LanguageProps {
    name: string;
    complete: number;
}

export default class LanguageCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, LanguageCommandData);
    }

    async commandExecute({ message, args, language }: { message: Message, args: string[], language: Languages }) {
        try {
            const guildLang = args[0];
            const guildData = await this.client.getData(message.guild?.id, 'guild');
            const userData = await this.client.getData(message.author.id, 'user');
            const data = guildData ?? userData;

            if (!data) {
                return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {
                const languages: Record<Languages, LanguageProps> = {
                    'pt-BR': {
                        name: 'pt-BR 🇧🇷',
                        complete: 100
                    },
                    'en-US': {
                        name: 'en-US 🇺🇸',
                        complete: 85
                    },
                    'es-ES': {
                        name: 'es-ES 🇪🇸',
                        complete: 0
                    }
                };

                if (guildLang) {
                    if (guildLang === data.lang) {
                        return void message.reply(this.client.t('config:language:responses.filter_currently'));
                    } else if (Object.entries(languages).some(([key, lang]) => lang.complete === 0 && key === guildLang)) {
                        return void message.channel.send(this.client.t('config:language:responses.unavailable'));
                    } else {
                        await data.updateOne({ $set: { lang: guildLang } }, { new: true });
                        this.client.t = await this.client.getTranslate(message.guild ? message.guild.id : message.author.id);

                        return void message.reply({ content: this.client.t('config:language.responses:success') });
                    }
                } else {
                    const embed = new ClientEmbed(this.client)
                        .setTitle(this.client.t('config:language.title'))
                        .setDescription(`${Object.entries(languages).map(([, lang]) => `${lang.name} - ${lang.complete}%`).join('\n')}\n\n${this.client.t('config:language.currently')} \`${language}\``);

                    const categories = Object.entries(languages).map(([key, value]) => ({ key, ...value }));

                    const menu = new StringSelectMenuBuilder()
                        .setCustomId('languages')
                        .setPlaceholder(this.client.t('config:language:menu.place'))
                        .addOptions([
                            {
                                label: this.client.t('config:language:menu.label'),
                                description: this.client.t('config:language:menu.description', { index: 0 }),
                                emoji: '❌',
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

                    collector.on('end', async () => {
                        menu.setDisabled(true);
                        await msg.edit({ embeds: [embed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })], components: [row] });
                    });

                    collector.on('collect', async (i: StringSelectMenuInteraction) => {
                        if (i.values[0] === 'cancel') {
                            menu.setDisabled(true);
                            await msg.edit({ components: [row] });
                            await message.channel.send({ content: this.client.t('config:language:responses.cancel') });
                        }

                        const id = i.values[0] as Languages;

                        if (id === data.lang) {
                            return void message.channel.send(this.client.t('config:language:responses.filter_currently'));
                        } else if (Object.entries(languages).some(([key, lang]) => lang.complete === 0 && key === id)) {
                            return void message.channel.send(this.client.t('config:language:responses.unavailable'));
                        } else {
                            await data.updateOne({ $set: { lang: id } }, { new: true });
                            this.client.t = await this.client.getTranslate(message.guild ? message.guild.id : message.author.id);

                            embed.setTitle(this.client.t('config:language.title'));
                            embed.setDescription(`${Object.entries(languages).map(([, lang]) => `${lang.name} - ${lang.complete}%`).join('\n')}\n\n${this.client.t('config:language.currently')} \`${i.values[0]}\``);

                            menu.setDisabled(true);
                            menu.setPlaceholder(this.client.t('config:language:menu.place'));

                            await msg.edit({ embeds: [embed], components: [row] });
                            await message.channel.send({ content: this.client.t('config:language:responses.success') });
                        }
                    });
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, LanguageCommand.name);
            this.client.logger.warn((err as Error).stack, LanguageCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}

