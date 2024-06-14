import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../Structures/';
import { WebhookClient, Collection, PermissionFlagsBits, ApplicationCommandOptionType, Events, TextChannel, Interaction, PermissionsBitField, InteractionReplyOptions, MessagePayload, InteractionEditReplyOptions, MessageResolvable, InteractionType } from 'discord.js';

export default class interactionCreateListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.InteractionCreate
        });
    }

    async eventExecute(interaction: Interaction) {
        try {
            if (interaction.user.bot || !interaction.guild) return;

            const client = await this.client.getData(this.client.user?.id, 'client');
            const server = await this.client.getData(interaction.guild.id, 'guild');

            //===============> Módulo de tradução <===============//

            const language = await this.client.getLanguage(interaction.guild.id);
            await this.client.getTranslate(interaction.guild.id);

            const prefix = server.prefix ?? process.env.PREFIX;
            const args: string[] = [];

            //===============> Comandos <===============//

            if (interaction.isCommand() || interaction.isContextMenuCommand()) {
                if (!(interaction.channel as TextChannel).permissionsFor(interaction.guild.members.me!).has(PermissionFlagsBits.SendMessages)) {
                    return void interaction.reply({ content: this.client.t('main:permissions.alert', { index: 3, member: interaction.member }), ephemeral: true });
                }

                interaction.options.data.forEach((option) => {
                    if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
                        if (option.name) {
                            args.push(option.name);
                        }

                        option.options?.forEach(options => {
                            if (options.name) {
                                args.push(options.name);
                            }

                            options.options?.forEach(options => {
                                if (options.name) {
                                    args.push(options.name);
                                }

                                if (options.value) {
                                    args.push(options.value as string);
                                }
                            });
                        });
                    } else if (option.type === ApplicationCommandOptionType.Subcommand) {
                        if (option.name) {
                            args.push(option.name);
                        }

                        option.options?.forEach(options => {
                            if (options.value) {
                                args.push(options.value as string);
                            }
                        });
                    } else if (option.value) {
                        args.push(option.value as string);
                    }
                });

                const command = this.client.commands.get(interaction.commandName) || this.client.contexts.get(interaction.commandName);

                if (command) {
                    try {
                        //===============> Cooldown:
                        if (!this.client.cooldowns.has(command.data.options.name)) {
                            this.client.cooldowns.set(command.data.options.name, new Collection());
                        }

                        const now = Date.now();
                        const timestamps = this.client.cooldowns.get(command.data.options.name);
                        const cooldownAmount = (command.data.options.config.cooldown || 2) * 1000;

                        if (timestamps?.has(interaction.user.id)) {
                            const time = timestamps.get(interaction.user.id);

                            if (time && now < time + cooldownAmount) {
                                const timeLeft = (time + cooldownAmount - now) / 1000;
                                return void interaction.reply({ content: this.client.t('main:cooldown.reply', { time: timeLeft.toFixed(1), command: command.data.options.name }), ephemeral: true }).catch(() => undefined);
                            }
                        }

                        //===============> Registrando comandos no banco de dados:

                        const cmdDb = await this.client.getData(command.data.options.name, 'command');

                        //===============> Manutenção do bot e comandos do bot:

                        const mainCmd = new ClientEmbed(this.client)
                            .setAuthor({ name: this.client.t('main:maintenance:command:embed.title', { command: command.data.options.name.replace(/^\w/, (c) => c.toUpperCase()) }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setDescription(this.client.t('main:maintenance:command:embed.description', { command: command.data.options.name }));

                        const mainBot = new ClientEmbed(this.client)
                            .setAuthor({ name: this.client.t('main:maintenance:client:embed.title', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setDescription(this.client.t('main:maintenance:client:embed.description'));

                        if (!this.client.developers.includes(interaction.user.id)) {
                            timestamps?.set(interaction.user.id, now);
                            setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

                            if (server.cmdblock.status) {
                                if (!(interaction.member?.permissions as Readonly<PermissionsBitField>).has(PermissionFlagsBits.ManageMessages)) {
                                    if (server.cmdblock.cmds.some((x) => x === command.data.options.name) || server.cmdblock.channels.some((x) => x === interaction.channel?.id)) {
                                        return void interaction.reply({ content: server.cmdblock.msg.replace(/{member}/g, `<@${interaction.user.id}>`).replace(/{channel}/g, `<#${interaction.channel?.id}`).replace(/{cmd}/g, command.data.options.name), ephemeral: true });
                                    }
                                }
                            }

                            if (cmdDb.maintenance) {
                                return void interaction.reply({ embeds: [mainCmd], ephemeral: true });
                            } else if (client.maintenance) {
                                return void interaction.reply({ embeds: [mainBot], ephemeral: true });
                            } else if (client.blacklist.some((x) => x == interaction.user.id)) {
                                return void interaction.reply({ content: this.client.t('main:blacklist.user', { user: interaction.user }), ephemeral: true });
                            }
                        }

                        //===============> Comandos de desenvolvedor:

                        if (command.data.options.config.devOnly && !this.client.developers.some((id) => [id].includes(interaction.user.id))) {
                            return void interaction.reply({ content: this.client.t('main:owner.reply', { client: this.client.user?.username }), ephemeral: true });
                        }

                        //===============> Execução dos comandos:

                        await interaction.deferReply({ fetchReply: true });

                        const message = Object.assign(interaction, {
                            author: interaction.user,
                            reply: async (options: string | MessagePayload | InteractionReplyOptions) => await interaction.followUp(options).catch(console.error),
                            edit: async (options: string | MessagePayload | InteractionEditReplyOptions) => await interaction.editReply(options).catch(console.error),
                            delete: async (message?: MessageResolvable) => { await interaction.deleteReply(message); }
                        });

                        //===============> Checando permissões dos membros e do cliente:

                        const checkPermissions = this.client.services.get('checkPermissions');

                        // Verificando permissões do membro:
                        const memberPermissions = checkPermissions?.serviceExecute({ message, command, language });
                        if (!memberPermissions) return;

                        // Verificando permissões do client:
                        const clientPermissions = checkPermissions?.serviceExecute({ message, command, language });
                        if (!clientPermissions) return;

                        //===============> Execução do comando:

                        const commandPromise = async (resolve: (value: void) => void, reject: (reason?: any) => void) => {
                            try {
                                resolve(await command.commandExecute({ message, args, language, prefix }));
                            } catch (err) {
                                reject(err);
                            }
                        }

                        const interactionExecute = new Promise(commandPromise);

                        interactionExecute.catch((err) => {
                            this.client.logger.error(err.message, command.data.options.name);
                            this.client.logger.warn(err.stack, command.data.options.name);

                            const errorChannel = new WebhookClient({ url: process.env.WEBHOOK_LOG_ERROR_URL });

                            const errorEmbed = new ClientEmbed(this.client)
                                .setTitle(command.data.options.name)
                                .setDescription('```js' + '\n' + err.stack + '\n' + '```');

                            errorChannel.send({ embeds: [errorEmbed] });
                            return interaction.reply({ content: this.client.t('main:errors.interaction', { index: 0 }), ephemeral: true });
                        });

                        interactionExecute.then(() => {
                            if (![process.env.OWNER_ID].includes(interaction.user.id) && interaction.guild) {
                                const webHook = new WebhookClient({ url: process.env.WEBHOOK_LOG_COMMAND_URL });
    
                                const keyByValue = (enumObject: object, value: number): string | undefined => {
                                    return Object.keys(enumObject).find(key => enumObject[key] === value);
                                };
    
                                const whEmbed = new ClientEmbed(this.client)
                                    .setThumbnail(interaction.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                                    .setAuthor({ name: `${this.client.user?.username} Commands Log`, iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                    .addFields(
                                        {
                                            name: 'Guild:',
                                            value: `\`${interaction.guild.name}\` \`(${interaction.guild.id})\``
                                        },
                                        {
                                            name: 'Author:',
                                            value: `\`${interaction.user.tag}\` \`(${interaction.user.id})\``
                                        },
                                        {
                                            name: 'Command Type:',
                                            value: `\`${keyByValue(InteractionType, interaction.type)}\``
                                        },
                                        {
                                            name: 'What was executed:',
                                            value: `**\`/${command.data.options.name}\`**`
                                        });
    
                                webHook.send({ embeds: [whEmbed] });
                            }

                            const num = cmdDb.usages;

                            cmdDb.updateOne({ $set: { usages: num + 1 }});
                        });
                    } catch (err) {
                        this.client.logger.error((err as Error).message, interactionCreateListener.name);
                        this.client.logger.warn((err as Error).stack!, interactionCreateListener.name);
                    }
                }
            }

            //===============> Botões <===============//

            if (interaction.isButton()) {
                if (interaction.customId === 'open') {
                    const { default: createTicketButton } = await import('../../Modules/Buttons/createTicket');
                    new createTicketButton(this.client).moduleExecute(interaction);
                }

                if (interaction.customId === 'close') {
                    const { default: closeTicketButton } = await import('../../Modules/Buttons/closeTicket');
                    new closeTicketButton(this.client).moduleExecute(interaction, language);
                }
            }

            //===============> Modal <===============//

            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'aboutme') {
                    const { default: aboutModal } = await import('../../Modules/Modals/aboutModal');
                    new aboutModal(this.client).moduleExecute(interaction);
                }

                if (interaction.customId === 'rep') {
                    const { default: repModal } = await import('../../Modules/Modals/repModal');
                    new repModal(this.client).moduleExecute(interaction);
                }
            }

            //==============================================//
        } catch (err) {
            this.client.logger.error((err as Error).message, interactionCreateListener.name);
            this.client.logger.warn((err as Error).stack!, interactionCreateListener.name); return;
        }
    }
}