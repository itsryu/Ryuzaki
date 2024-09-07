import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { LogsCommandData } from '../../Data/Commands/Settings/LogsCommandData';
import { Message, ActionRowBuilder, StringSelectMenuBuilder, MessageComponentInteraction, StringSelectMenuInteraction, EmbedBuilder } from 'discord.js';
import { emojis } from '../../Utils/Objects/emojis';
import { GuildDocument } from '../../Types/SchemaTypes';
import { Logger } from '../../Utils/logger';

export default class LogsCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, LogsCommandData);
    }

    public async commandExecute({ message }: { message: Message }) {
        try {
            const guildData = await this.client.getData(message.guild?.id, 'guild');

            if (!guildData) {
                return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {
                const embed = new ClientEmbed(this.client)
                    .setAuthor({ name: `Logs - ${message.guild?.name}`, iconURL: message.guild?.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                    .setThumbnail(message.guild?.iconURL({ extension: 'png', size: 4096 }) ?? null)
                    .setDescription('O sistema de logs consiste em definir um canal onde ficará salvo os registros de eventos relevantes que acontecem no servidor.')
                    .addFields(
                        {
                            name: 'Canal definido:',
                            value: guildData.logs.channel == null ? '\`Nenhum canal definido\`.' : `<#${guildData.logs.channel}>`
                        },
                        {
                            name: 'Status do sistema:',
                            value: `O sistema se encontra: **\`${guildData.logs.status ? 'ativado' : 'desativado'}\`.**`
                        });

                const menu = new StringSelectMenuBuilder()
                    .setCustomId('logs')
                    .setPlaceholder('Defina uma função:')
                    .addOptions([
                        {
                            label: 'Definir um canal',
                            description: `Defina um canal que será enviado os registros de logs do ${this.client.user?.username}.`,
                            emoji: '💡',
                            value: 'definir'
                        },
                        {
                            label: 'Ativar/desativar os registros de logs',
                            description: `Ativa ou desativa os registros e logs do ${this.client.user?.username}.`,
                            emoji: guildData.logs.status ? emojis.activated : emojis.disabled,
                            value: 'status'
                        },
                        {
                            label: 'Configurar logs',
                            description: 'Configura quais logs serão exibidos.',
                            emoji: '⚙️',
                            value: 'config'
                        }
                    ]);

                const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
                const msg = await message.reply({ embeds: [embed], components: [row] });
                const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isStringSelectMenu() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('end', () => {
                    menu.setDisabled(true);
                    return void msg.edit({ embeds: [embed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })], components: [row] });
                });

                collector.on('collect', async (interaction: StringSelectMenuInteraction) => {
                    if (interaction.values[0] === 'config') {
                        const configMenu = new StringSelectMenuBuilder()
                            .setCustomId('config')
                            .setPlaceholder('Ative ou desative os logs:')
                            .addOptions(
                                {
                                    label: 'Voltar',
                                    description: 'Voltar ao menu principal',
                                    emoji: '↩',
                                    value: 'back'
                                },
                                {
                                    label: 'Mensagens',
                                    description: 'Ativa ou desativa as atualizações de mensagens.',
                                    emoji: guildData.logs.messages ? emojis.activated : emojis.disabled,
                                    value: 'messages'
                                },
                                {
                                    label: 'Calls',
                                    description: 'Ativa ou desativa as atualizações de calls.',
                                    emoji: guildData.logs.calls ? emojis.activated : emojis.disabled,
                                    value: 'calls'
                                },
                                {
                                    label: 'Moderação',
                                    description: 'Ativa ou desativa as atualizações de moderação.',
                                    emoji: guildData.logs.moderation ? emojis.activated : emojis.disabled,
                                    value: 'moderation'
                                },
                                {
                                    label: 'Invites',
                                    description: 'Ativa ou desativa as atualizações de convites.',
                                    emoji: guildData.logs.invites ? emojis.activated : emojis.disabled,
                                    value: 'invites'
                                });

                        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(configMenu);
                        const replied = await message.channel.send({ content: 'Configura quais registros serão exibidos no canal de logs:', components: [row] });
                        const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isStringSelectMenu() && i.message.id === replied.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                        const collector = replied.createMessageComponentCollector({ filter, time: 60000 });

                        collector.on('end', () => {
                            configMenu.setDisabled(true);
                            return void replied.edit({ components: [row] });
                        });

                        collector.on('collect', async (interaction: StringSelectMenuInteraction) => {
                            if (interaction.values[0] === 'back') {
                                return void await replied.delete();
                            }

                            if (interaction.values[0] === 'messages') {
                                if (guildData.logs.messages) {
                                    guildData.logs.messages = false;
                                    await guildData.save();

                                    this.updateFirstMenu(configMenu, guildData);

                                    replied.edit({
                                        components: [row]
                                    });

                                    return void message.channel.send({ content: 'O sistema foi desativado com sucesso.' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                } else {
                                    guildData.logs.messages = true;
                                    await guildData.save();

                                    this.updateFirstMenu(configMenu, guildData);

                                    replied.edit({
                                        components: [row]
                                    });

                                    return void message.channel.send({ content: 'O sistema foi ativado com sucesso.' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                }
                            }

                            if (interaction.values[0] === 'calls') {
                                if (guildData.logs.calls) {
                                    guildData.logs.calls = false;
                                    await guildData.save();

                                    this.updateFirstMenu(configMenu, guildData);

                                    replied.edit({
                                        components: [row]
                                    });

                                    return void message.channel.send({ content: 'O sistema foi desativado com sucesso.' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                } else {
                                    guildData.logs.calls = true;
                                    await guildData.save();

                                    this.updateFirstMenu(configMenu, guildData);

                                    replied.edit({
                                        components: [row]
                                    });

                                    return void message.channel.send({ content: 'O sistema foi ativado com sucesso.' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                }
                            }

                            if (interaction.values[0] === 'moderation') {
                                if (guildData.logs.moderation) {
                                    guildData.logs.moderation = false;
                                    await guildData.save();

                                    this.updateFirstMenu(configMenu, guildData);

                                    replied.edit({
                                        components: [row]
                                    });

                                    return void message.channel.send({ content: 'O sistema foi desativado com sucesso.' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                } else {
                                    guildData.logs.moderation = true;
                                    await guildData.save();

                                    this.updateFirstMenu(configMenu, guildData);

                                    replied.edit({
                                        components: [row]
                                    });

                                    return void message.channel.send({ content: 'O sistema foi ativado com sucesso.' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                }
                            }

                            if (interaction.values[0] === 'invites') {
                                if (guildData.logs.invites) {
                                    guildData.logs.invites = false;
                                    await guildData.save();

                                    this.updateFirstMenu(configMenu, guildData);

                                    replied.edit({
                                        components: [row]
                                    });

                                    return void message.channel.send({ content: 'O sistema foi desativado com sucesso.' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                } else {
                                    guildData.logs.invites = true;
                                    await guildData.save();

                                    this.updateFirstMenu(configMenu, guildData);

                                    replied.edit({
                                        components: [row]
                                    });

                                    return void message.channel.send({ content: 'O sistema foi ativado com sucesso.' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                }
                            }
                        });
                    }

                    if (interaction.values[0] === 'definir') {
                        const logMessage = await message.channel.send({ content: 'Mencione ou insira o ID do canal de logs:' });

                        const filter = (msg: Message) => msg.author.id === message.author.id;
                        const messageCollector = await interaction.channel?.awaitMessages({ filter: filter, max: 1 });

                        if (messageCollector) {
                            const content = messageCollector.first()?.content;

                            if (content) {
                                const channel = message.guild?.channels.cache.get(content) ?? messageCollector.first()?.mentions.channels.first();

                                if (['cancel', 'cancelar'].includes(content)) {
                                    return void message.channel.send({ content: 'Operação cancelada com sucesso!' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                } else if (!channel) {
                                    return void message.channel.send({ content: 'O canal inserido não foi encontrado.' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                } else if (channel.id == guildData.logs.channel) {
                                    return void message.channel.send({ content: 'O canal inserido é o mesmo definido atualmente.' })
                                        .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                                } else {
                                    guildData.logs.channel = channel.id;
                                    await guildData.save();

                                    this.updateEmbed(embed, guildData);

                                    msg.edit({
                                        embeds: [embed]
                                    });

                                    await logMessage.delete();
                                    return void message.channel.send({ content: `O **\`canal de logs\`** foi definido para <#${channel.id}> com sucesso.` });
                                }
                            }
                        }
                    }

                    if (interaction.values[0] === 'status') {
                        if (!guildData.logs.channel) {
                            return void message.channel.send({ content: 'Para ativar o `sistema de logs`, você deve definir um canal primeiro.' })
                                .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                        } else if (guildData.logs.status) {
                            guildData.logs.status = false;
                            await guildData.save();

                            this.updateEmbed(embed, guildData);
                            this.updateSecondMenu(menu, guildData);

                            msg.edit({
                                embeds: [embed],
                                components: [row]
                            });

                            return void message.channel.send({ content: 'O sistema foi desativado com sucesso.' })
                                .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                        } else {
                            guildData.logs.status = true;
                            await guildData.save();

                            this.updateEmbed(embed, guildData);
                            this.updateSecondMenu(menu, guildData);

                            msg.edit({
                                embeds: [embed],
                                components: [row]
                            });

                            return void message.channel.send({ content: 'O sistema foi ativado com sucesso.' })
                                .then((msg: Message) => setTimeout(() => msg.delete(), 10000));
                        }
                    }

                });
            }
        } catch (err) {
            Logger.error((err as Error).message, LogsCommand.name);
            Logger.warn((err as Error).stack, LogsCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }

    updateFirstMenu(menu: StringSelectMenuBuilder, data: GuildDocument | null) {
        if (data) {
            menu.setOptions(
                {
                    label: 'Voltar',
                    description: 'Voltar ao menu principal',
                    emoji: '↩',
                    value: 'back'
                },
                {
                    label: 'Mensagens',
                    description: 'Ativa ou desativa as atualizações de mensagens.',
                    emoji: data.logs.messages ? emojis.activated : emojis.disabled,
                    value: 'messages'
                },
                {
                    label: 'Calls',
                    description: 'Ativa ou desativa as atualizações de calls.',
                    emoji: data.logs.calls ? emojis.activated : emojis.disabled,
                    value: 'calls'
                },
                {
                    label: 'Moderação',
                    description: 'Ativa ou desativa as atualizações de moderação.',
                    emoji: data.logs.moderation ? emojis.activated : emojis.disabled,
                    value: 'moderation'
                },
                {
                    label: 'Convites',
                    description: 'Ativa ou desativa as atualizações de convites.',
                    emoji: data.logs.invites ? emojis.activated : emojis.disabled,
                    value: 'invites'
                });

            return menu;
        }
    }

    updateSecondMenu(menu: StringSelectMenuBuilder, data: GuildDocument | null) {
        if (data) {
            menu.setOptions([
                {
                    label: 'Definir um canal',
                    description: `Defina um canal que será enviado os registros de logs do ${this.client.user?.username}.`,
                    emoji: '💡',
                    value: 'definir'
                },
                {
                    label: 'Ativar/desativar o registro de logs',
                    description: `Ativa ou desativa o registro e logs do ${this.client.user?.username}.`,
                    emoji: data.logs.status ? emojis.activated : emojis.disabled,
                    value: 'status'
                },
                {
                    label: 'Configurar logs',
                    description: 'Configura quais logs serão exibidos.',
                    emoji: '⚙️',
                    value: 'config'
                }
            ]);
        }
    }

    updateEmbed(embed: EmbedBuilder, data: GuildDocument | null) {
        if (data) {
            embed.setFields(
                {
                    name: 'Canal definido:',
                    value: data.logs.channel == null ? '\`Nenhum canal definido\`.' : `<#${data.logs.channel}>`
                },
                {
                    name: 'Status do sistema:',
                    value: `O sistema se encontra: **\`${data.logs.status ? 'ativado' : 'desativado'}\`.**`
                });

            return embed;
        }
    }
}