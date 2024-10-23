import { Ryuzaki } from '../../ryuzakiClient';
import { ListenerStructure, ClientEmbed, CommandStructure, ContextCommandStructure } from '../../structures';
import { WebhookClient, Collection, PermissionFlagsBits, ApplicationCommandOptionType, Events, TextChannel, Interaction, PermissionsBitField, InteractionReplyOptions, MessagePayload, InteractionEditReplyOptions, MessageResolvable, InteractionType, ChatInputCommandInteraction, ChannelType, Message } from 'discord.js';
import { Logger, Util } from '../../utils';

export default class InteractionCreateListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.InteractionCreate
        });
    }

    public async eventExecute(interaction: Interaction) {
        try {
            if (interaction.user.bot) return;

            const clientData = await this.client.getData(this.client.user?.id, 'client');
            const guildData = await this.client.getData(interaction.guild?.id, 'guild');
            const userData = await this.client.getData(interaction.user.id, 'user');

            //===============> Módulo de tradução <===============//

            const language = await this.client.getLanguage(interaction.guild ? interaction.guild.id : interaction.user.id);
            await this.client.getTranslate(interaction.guild ? interaction.guild.id : interaction.user.id);

            const prefix = guildData ? guildData.prefix : userData ? userData.prefix : process.env.PREFIX;
            const args: string[] = [];

            //===============> Comandos <===============//

            if (interaction.isCommand() || interaction.isContextMenuCommand()) {
                if (interaction.guild && !(interaction.channel as TextChannel).permissionsFor(interaction.guild.members.me!).has(PermissionFlagsBits.SendMessages)) {
                    return void await interaction.reply({ content: this.client.t('main:permissions.alert', { index: 3, member: interaction.member }), ephemeral: true });
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

                const command = this.client.commands.get(interaction.commandName) ?? this.client.contexts.get(interaction.commandName);

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
                                return void await interaction.reply({ content: this.client.t('main:cooldown.reply', { time: timeLeft.toFixed(1), command: command.data.options.name }), ephemeral: true }).catch(() => undefined);
                            }
                        }

                        //===============> Registrando comandos no banco de dados:

                        const commandData = await this.client.getData(command.data.options.name, 'command');

                        //===============> Manutenção do bot e comandos do bot:

                        const mainCmd = new ClientEmbed(this.client)
                            .setAuthor({ name: this.client.t('main:maintenance:command:embed.title', { command: command.data.options.name.replace(/^\w/, (c) => c.toUpperCase()) }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setDescription(this.client.t('main:maintenance:command:embed.description', { command: command.data.options.name, reason: commandData?.reason }));

                        const mainBot = new ClientEmbed(this.client)
                            .setAuthor({ name: this.client.t('main:maintenance:client:embed.title', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setDescription(this.client.t('main:maintenance:client:embed.description', { reason: clientData?.reason }));

                        if (!this.client.developers.includes(interaction.user.id)) {
                            timestamps?.set(interaction.user.id, now);
                            setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

                            if (guildData?.cmdblock.status) {
                                if (!(interaction.member?.permissions as Readonly<PermissionsBitField>).has(PermissionFlagsBits.ManageMessages)) {
                                    if (guildData.cmdblock.cmds.some((x) => x === command.data.options.name) || guildData.cmdblock.channels.some((x) => x === interaction.channel?.id)) {
                                        return void await interaction.reply({ content: guildData.cmdblock.msg.replace(/{member}/g, `<@${interaction.user.id}>`).replace(/{channel}/g, `<#${interaction.channel?.id}`).replace(/{cmd}/g, command.data.options.name), ephemeral: true });
                                    }
                                }
                            }

                            if (commandData && commandData.maintenance) {
                                return void await interaction.reply({ embeds: [mainCmd], ephemeral: true });
                            } else if (clientData?.maintenance) {
                                return void await interaction.reply({ embeds: [mainBot], ephemeral: true });
                            } else if (clientData?.blacklist.some((x) => x == interaction.user.id)) {
                                return void await interaction.reply({ content: this.client.t('main:blacklist.user', { user: interaction.user }), ephemeral: true });
                            }
                        }

                        //===============> Comandos de desenvolvedor:

                        if (command.data.options.config.devOnly && !this.client.developers.some((id) => [id].includes(interaction.user.id))) {
                            return void await interaction.reply({ content: this.client.t('main:owner.reply', { client: this.client.user?.username }), ephemeral: true });
                        }

                        //===============> Comandos de DM:

                        if (interaction.channel?.type === ChannelType.DM && !command.data.options.config.isDMAllowed) {
                            return void await interaction.reply({ content: `${interaction.user}, este comando não pode ser executado em sua DM, tente executa-lo em um servidor.` });
                        }

                        //===============> Execução dos comandos:

                        command.data.options.config.ephemeral ? (await interaction.deferReply({ fetchReply: true, ephemeral: true })) : (await interaction.deferReply({ fetchReply: true }));

                        const message = Object.assign(interaction, {
                            author: interaction.user,
                            reply: async (options: string | MessagePayload | InteractionReplyOptions) => await interaction.followUp(options).catch((err: unknown) => { Logger.error((err as Error).message, InteractionCreateListener.name); }),
                            edit: async (options: string | MessagePayload | InteractionEditReplyOptions) => await interaction.editReply(options).catch((err: unknown) => { Logger.error((err as Error).message, InteractionCreateListener.name); }),
                            delete: async (message?: MessageResolvable) => { await interaction.deleteReply(message); }
                        }) as Message & ChatInputCommandInteraction;

                        //===============> Checando permissões dos membros e do cliente:

                        const checkPermissions = this.client.services.get('CheckPermissions');

                        // Verificando permissões do membro:
                        const memberPermissions = await checkPermissions?.serviceExecute({ message, command, language });
                        if (!memberPermissions) return;

                        // Verificando permissões do client:
                        const clientPermissions = await checkPermissions?.serviceExecute({ message, command, language });
                        if (!clientPermissions) return;

                        //===============> Execução do comando:

                        const commandPromise = async (resolve: (value: CommandStructure | ContextCommandStructure | PromiseLike<CommandStructure | ContextCommandStructure>) => void, reject: (reason?: any) => void) => {
                            try {
                                await command.commandExecute({ message, args, language, prefix });

                                resolve(command);
                            } catch (err) {
                                reject(err);
                            }
                        };

                        const interactionExecute = new Promise<CommandStructure | ContextCommandStructure>(commandPromise);

                        await interactionExecute
                            .catch(async (err: unknown) => {
                                Logger.error((err as Error).message, command.data.options.name);
                                Logger.warn((err as Error).stack, command.data.options.name);

                                const errorChannel = new WebhookClient({ url: process.env.WEBHOOK_LOG_ERROR_URL });

                                const errorEmbed = new ClientEmbed(this.client)
                                    .setTitle(command.data.options.name)
                                    .setDescription('```js' + '\n' + ((err as Error).stack ?? (err as Error).message) + '\n' + '```');

                                await errorChannel.send({ embeds: [errorEmbed] });
                                return interaction.reply({ content: this.client.t('main:errors.interaction', { index: 0 }), ephemeral: true });
                            });

                        await interactionExecute
                            .then(async () => {
                                if (![process.env.OWNER_ID].includes(interaction.user.id) && interaction.channel) {
                                    const webHook = new WebhookClient({ url: process.env.WEBHOOK_LOG_COMMAND_URL });

                                    const getInteractionType = (enumObject: object, value: number): string | undefined => {
                                        return Object.keys(enumObject).find(key => enumObject[key] === value);
                                    };

                                    const whEmbed = new ClientEmbed(this.client)
                                        .setThumbnail(interaction.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                                        .setAuthor({ name: `${this.client.user?.username} Commands Log`, iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                        .addFields(
                                            {
                                                name: 'Guild:',
                                                value: interaction.channel.type === ChannelType.DM ? (`${interaction.user} \`(${interaction.user.id})\``) : (`\`${interaction.guild?.name}\` \`(${interaction.guild?.id})\``)
                                            },
                                            {
                                                name: 'Author:',
                                                value: `\`${interaction.user.tag}\` \`(${interaction.user.id})\``
                                            },
                                            {
                                                name: 'Command Type:',
                                                value: `\`${getInteractionType(InteractionType, interaction.type)}\``
                                            },
                                            {
                                                name: 'What was executed:',
                                                value: `**\`/${command.data.options.name}\`**`
                                            });

                                    await webHook.send({ embeds: [whEmbed] });
                                }

                                if (userData && commandData) {
                                    commandData.set({
                                        'usages': commandData.usages + 1
                                    });

                                    userData.set({
                                        'commands.usages': userData.commands.usages + 1
                                    });

                                    await commandData.save();
                                    await userData.save();

                                    //===============> Levels:
                                    const { default: XPModule } = await import('../../modules/XPModule');
                                    await new XPModule(this.client).moduleExecute({ message });
                                }
                            });
                    } catch (err) {
                        Logger.error((err as Error).message, InteractionCreateListener.name);
                        Logger.warn((err as Error).stack, InteractionCreateListener.name);
                    }
                }
            }

            //===============> Botões <===============//

            interface ParsedId {
                c?: string;
                k?: string;
                e?: ClientEmbed[]
            }

            if (interaction.isButton()) {
                if (interaction.customId === 'open') {
                    const { default: CreateTicketButton } = await import('../../modules/buttons/createTicketButton');
                    await new CreateTicketButton(this.client).moduleExecute(interaction);
                }

                if (interaction.customId === 'close') {
                    const { default: CloseTicketButton } = await import('../../modules/buttons/closeTicketButton');
                    await new CloseTicketButton(this.client).moduleExecute(interaction, language);
                }

                if (Util.isJSON(interaction.customId)) {
                    const parsedId = JSON.parse(interaction.customId) as ParsedId;

                    if (parsedId && Object.keys(parsedId).length > 0 && parsedId.c === 'calculator') {
                        const { default: CalculatorButton } = await import('../../modules/buttons/calculatorButton');
                        await new CalculatorButton(this.client).moduleExecute(interaction);
                    }
                }
            }

            //===============> Modal <===============//

            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'aboutme') {
                    const { default: aboutModal } = await import('../../modules/modals/aboutModal');
                    await new aboutModal(this.client).moduleExecute(interaction);
                }

                if (interaction.customId === 'rep') {
                    const { default: repModal } = await import('../../modules/modals/repModal');
                    await new repModal(this.client).moduleExecute(interaction);
                }
            }

            //===============> Auto Complete <===============//

            if (interaction.isAutocomplete()) {
                try {
                    if (interaction.commandName === 'help') {
                        const input = interaction.options.getFocused();

                        const commands = this.client.commands
                            .map((command) => command.data.options.name)
                            .filter((command) => command.toLowerCase().startsWith(input) && command.toLowerCase().includes(input));

                        const response = commands.slice(0, 25).map((name) => ({ name, value: name }));

                        await interaction.respond(response);
                    }
                } catch (err) {
                    Logger.error((err as Error).message, InteractionCreateListener.name);
                    Logger.warn((err as Error).stack, InteractionCreateListener.name);
                }
            }


            //==============================================//
        } catch (err) {
            Logger.error((err as Error).message, InteractionCreateListener.name);
            Logger.warn((err as Error).stack, InteractionCreateListener.name); return;
        }
    }
}