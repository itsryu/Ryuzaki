import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { HelpCommandData } from '../../Data/Commands/Infos/HelpCommandData';
import { PermissionFlagKey, PermissionsFlagsText } from '../../Utils/Objects/flags';
import { CategoryValidation, Languages } from '../../Types/ClientTypes';
import { Message, ActionRowBuilder, StringSelectMenuBuilder, MessageComponentInteraction, StringSelectMenuInteraction, PermissionsBitField } from 'discord.js';
import { categoryEmojis } from '../../Utils/Objects/emojis';

export default class helpCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, HelpCommandData);
    }

    async commandExecute({ message, args, prefix, language }: { message: Message, args: string[], prefix: string, language: Languages }) {
        const { commands } = this.client;

        const embed = new ClientEmbed(this.client)
            .setAuthor({ name: this.client.t('infos:help:embed.title', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })

        if (args[0]) {
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find((command) => command.data.options.aliases && command.data.options.aliases[language].includes(name));

            if (!command) {
                return void message.reply({ content: this.client.t('infos:help.!command', { name }) });
            } else {
                const memberPermissions = new PermissionsBitField(command.data.options.permissions.member);
                const clientPermissions = new PermissionsBitField(command.data.options.permissions.client);

                const memberPermArray = Object.entries(PermissionsFlagsText)
                    .filter(([flag]) => memberPermissions.toArray().includes(flag as PermissionFlagKey))
                    .map(([, text]) => text[language]);

                const clientPermArray = Object.entries(PermissionsFlagsText)
                    .filter(([flag]) => clientPermissions.toArray().includes(flag as PermissionFlagKey))
                    .map(([, text]) => text[language]);

                const commandData = await this.client.getData(command.data.options.name, 'command');

                embed.setDescription(
                    (
                        (memberPermArray.length === 0
                            ? this.client.t('infos:help:permissions.member', { index: 0 })
                            : this.client.t('infos:help:permissions.member', { index: 1, permission: memberPermArray.join(', ').replace(/,([^,]*)$/, ' e$1') })) + '\n\n' +
                        (clientPermArray.length === 0
                            ? this.client.t('infos:help:permissions.client', { index: 0, client: this.client.user })
                            : this.client.t('infos:help:permissions.client', { index: 1, client: this.client.user, permission: clientPermArray.join(', ').replace(/,([^,]*)$/, ' ' + this.client.t('infos:help:permissions.separator')) }))
                    )
                );

                embed.addFields({ name: this.client.t('infos:help.fields', { index: 0 }), value: `\`${command.data.options.name.replace(/^\w/, (c) => c.toUpperCase())}\``, inline: true });

                if (command.data.options.aliases && command.data.options.aliases[language].length) {
                    embed.addFields({ name: this.client.t('infos:help.fields', { index: 1 }), value: `\`${!command.data.options.aliases[language].length ? this.client.t('infos:help.fields_1', { index: 0 }) : command.data.options.aliases[language].join(', ')}\``, inline: true });
                }
                if (command.data.options.category) {
                    embed.addFields({ name: this.client.t('infos:help.fields', { index: 2 }), value: `\`${command.data.options.category[language]}\``, inline: true });
                }
                if (command.data.options.description_localizations?.[language]) {
                    embed.addFields({ name: this.client.t('infos:help.fields', { index: 3 }), value: `\`${!commandData ? this.client.t('infos:help.values', { index: 0 }) : commandData.usages === 0 ? this.client.t('infos:help.values', { index: 1 }) : `${commandData.usages}`}\``, inline: true });
                    embed.addFields({ name: this.client.t('infos:help.fields', { index: 4 }), value: `\`${command.data.options.description_localizations[language]?.length ? command.data.options.description_localizations[language] : this.client.t('infos:help.fields_1', { index: 1 })}\``, inline: true });
                }
                if (command.data.options.usage) {
                    embed.addFields({ name: this.client.t('infos:help.fields', { index: 5 }), value: command.data.options.usage[language].length ? command.data.options.usage[language].map((usage) => `\`${command.data.options.name_localizations ? prefix + command.data.options.name_localizations[language] : prefix + command.data.options.name} ${usage}\``).join('\n') : `\`${command.data.options.name_localizations ? prefix + command.data.options.name_localizations[language] : prefix + command.data.options.name}\``, inline: true });
                }
                if (command.data.options.config.cooldown) {
                    embed.addFields({ name: this.client.t('infos:help.fields', { index: 6 }), value: `\`${command.data.options.config.cooldown} ${this.client.t('infos:help.fields_1', { index: 2 })}\``, inline: true });
                }

                return void message.reply({ embeds: [embed] });
            }
        } else {
            const help = new ClientEmbed(this.client)
                .setAuthor({ name: this.client.t('infos:help:embed.title', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                .setDescription(this.client.t('infos:help:embed.description', { author: message.author, prefix, client: this.client.user?.username }))
                .setThumbnail(this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) ?? null);

            const menu = new StringSelectMenuBuilder()
                .setCustomId('categories')
                .setPlaceholder(this.client.t('infos:help:menu.place'))
                .addOptions([
                    {
                        label: this.client.t('infos:help:menu.label'),
                        description: this.client.t('infos:help:menu.description', { index: 0 }),
                        emoji: '⬅️',
                        value: 'back'
                    }
                ]);

            const supressedCategories: CategoryValidation<Languages>[] = [
                {
                    "en-US": "Developer",
                    "pt-BR": "Desenvolvedor",
                    "es-ES": "Desarrollador"
                }
            ];

            const categories = commands.map((command) => command.data.options.category[language]).filter((x, y, z) => z.indexOf(x) === y && supressedCategories.some((category) => category[language] !== x));

            categories.forEach((category) => {
                menu.addOptions([
                    {
                        label: category,
                        description: this.client.t('infos:help:menu.description', { index: 1, category: category }),
                        emoji: categoryEmojis[language][category],
                        value: category
                    }]
                );
            });

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
            const msg = await message.reply({ embeds: [help], components: [row] });
            const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isStringSelectMenu() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 2 });

            collector.on('end', () => {
                menu.setDisabled(true);
                help.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });
                msg.edit({ embeds: [help], components: [row] });
            });

            collector.on('collect', (i: StringSelectMenuInteraction) => {
                if (i.values[0] == 'back') {
                    help.setThumbnail(this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) ?? null);
                    help.setAuthor({ name: this.client.t('infos:help:embed.title', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });
                    help.setDescription(this.client.t('infos:help:embed.description', { author: message.author, prefix, client: this.client.user?.username }));
                    help.spliceFields(0, 1);

                    return void msg.edit({ embeds: [help] });
                } else {
                    const comandos = commands.filter((command) => command.data.options.category != null && command.data.options.category[language] === i.values[0]).sort((a, b) => a.data.options.name.localeCompare(b.data.options.name)).map((f) => f.data.options.name);

                    help.setThumbnail(null);
                    help.setDescription(`${this.client.t('infos:help.fields', { index: 7 })} \`${i.values[0]}\``);
                    help.setFields({ name: `[${comandos.length}] ${this.client.t('infos:help.fields', { index: 7 })}`, value: `\`${comandos.join(' - ')}.\`` || this.client.t('infos:help.fields_1')[3], inline: false });

                    return void msg.edit({ embeds: [help] });
                }
            });
        }
    }
}