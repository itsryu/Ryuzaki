import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure, ClientEmbed, CommandStructure } from '../../Structures';
import { Message, Collection, WebhookClient, PermissionFlagsBits, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, User, MessageReaction, Colors, GuildChannel, ChannelType } from 'discord.js';
import { emojis } from '../../Utils/Objects/emojis';

export default class MessageCreateListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.MessageCreate
        });
    }

    public async eventExecute(message: Message): Promise<void> {
        if (message.author.bot) return;

        try {
            const clientData = await this.client.getData(this.client.user?.id, 'client');
            const guildData = await this.client.getData(message.guild?.id, 'guild');
            const userData = await this.client.getData(message.author.id, 'user');
            const prefix = guildData ? guildData.prefix : userData ? userData.prefix : process.env.PREFIX;

            //===============> Módulo de tradução <===============//

            const language = message.guild ? await this.client.getLanguage(message.guild.id) : await this.client.getLanguage(message.author.id);
            await this.client.getTranslate(message.guild ? message.guild.id : message.author.id);

            //===============> Menções <===============//

            if (message.guild && !(message.channel as GuildChannel).permissionsFor(message.guild.members.me!).has(PermissionFlagsBits.SendMessages)) {
                return void await message.member?.send({ content: this.client.t('main:permissions.alert', { index: 3, member: message.member }) })
                    .catch(() => undefined);
            }

            if (this.client.user && message.content.match(this.client.utils.GetMention(this.client.user.id))) {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setURL('https://github.com/itsryu/Ryuzaki')
                            .setStyle(ButtonStyle.Link)
                            .setEmoji(emojis.github)
                            .setLabel(this.client.t('main:mentions:button.github')),
                        new ButtonBuilder()
                            .setURL(this.client.url)
                            .setStyle(ButtonStyle.Link)
                            .setEmoji(emojis.pin)
                            .setLabel(this.client.t('main:mentions:button.add')),
                        new ButtonBuilder()
                            .setURL('https://discord.gg/R23XkNvRH2')
                            .setStyle(ButtonStyle.Link)
                            .setEmoji(emojis.partner)
                            .setLabel(this.client.t('main:mentions:button.support'))
                    );

                return void await message.reply({ content: this.client.t('main:mentions.client', { author: message.author, name: this.client.user?.username, prefix: prefix }), components: [row] });
            }

            //===============> Exportações de Comandos <===============//

            if (message.content.startsWith(prefix)) {
                const [name, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
                const command = this.client.commands.get(name) ?? this.client.commands.find((command) => command.data.options.aliases ? command.data.options.aliases[language]?.includes(name) : undefined);

                if (!command) {
                    if (message.content === prefix) return;

                    const searchCommand = this.client.commands.find((command) => new RegExp(name, 'i').test(command.data.options.name));

                    if (!searchCommand) {
                        return void await message.reply({ content: this.client.t('main:errors.message', { index: 1, command: name }) })
                            .then((message) => setTimeout(() => message.delete(), 1000 * 15));
                    }

                    const command = searchCommand.data.options.name;

                    return void await message.reply({ content: this.client.t('main:errors.message', { index: 2, command, prefix }) })
                        .then((message) => setTimeout(() => message.delete(), 1000 * 15));

                } else {
                    //===============> Cooldowns <===============//
                    if (!this.client.cooldowns.has(command.data.options.name)) {
                        this.client.cooldowns.set(command.data.options.name, new Collection());
                    }

                    const now = Date.now();
                    const timestamps = this.client.cooldowns.get(command.data.options.name);
                    const cooldownAmount = (command.data.options.config.cooldown || 2) * 1000;

                    if (timestamps?.has(message.author.id)) {
                        const time = timestamps.get(message.author.id);

                        if (time && now < time + cooldownAmount) {
                            const timeLeft = (time + cooldownAmount - now) / 1000;
                            return void await message.reply({ content: this.client.t('main:cooldown.reply', { time: timeLeft.toFixed(1), command: command.data.options.name }) }).catch(() => undefined);
                        }
                    }

                    //============================================//

                    const commandData = await this.client.getData(command.data.options.name, 'command');

                    const mainCmd = new ClientEmbed(this.client)
                        .setAuthor({ name: this.client.t('main:maintenance:command:embed.title', { command: command.data.options.name.replace(/^\w/, (c) => c.toUpperCase()) }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(this.client.t('main:maintenance:command:embed.description', { command: command.data.options.name, reason: commandData?.reason }));

                    const mainBot = new ClientEmbed(this.client)
                        .setAuthor({ name: this.client.t('main:maintenance:client:embed.title', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(this.client.t('main:maintenance:client:embed.description', { reason: clientData?.reason }));

                    if (!this.client.developers.includes(message.author.id)) {
                        timestamps?.set(message.author.id, now);
                        setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);

                        if (guildData?.cmdblock.status) {
                            if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
                                if (guildData.cmdblock.cmds.some((x) => x === command.data.options.name || guildData.cmdblock.channels.some((x) => x === message.channel.id))) {
                                    return void await message.reply({ content: guildData.cmdblock.msg.replace(/{member}/g, `<@${message.author.id}>`).replace(/{channel}/g, `<#${message.channel.id}>`).replace(/{command}/g, command.data.options.name) })
                                        .then((sent) => setTimeout(() => sent.delete(), 10000))
                                        .catch((err: unknown) => { this.client.logger.warn((err as Error).stack, MessageCreateListener.name); });
                                }
                            }
                        }

                        if (commandData && commandData.maintenance) {
                            return void await message.reply({ embeds: [mainCmd] });
                        } else if (clientData?.maintenance) {
                            return void await message.reply({ embeds: [mainBot] });
                        } else if (clientData?.blacklist.some((x) => x == message.author.id)) {
                            return void await message.reply({ content: this.client.t('main:blacklist.user', { user: message.author }) });
                        }
                    }

                    if (command.data.options.config.devOnly && !this.client.developers.some((id) => [id].includes(message.author.id))) {
                        return void await message.reply({ content: this.client.t('main:owner.reply', { client: this.client.user?.username }) });
                    }

                    if (message.channel.type === ChannelType.DM && !command.data.options.config.isDMAllowed) {
                        return void await message.reply({ content: `${message.author}, este comando não pode ser executado em sua DM, tente executa-lo em um servidor.` });
                    }

                    if (command.data.options.config.args && !args.length) {
                        const embedHelp = new ClientEmbed(this.client)
                            .setAuthor({ name: prefix + command.data.options.name, iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setThumbnail(this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) ?? null);

                        if (command.data.options.description && command.data.options.description_localizations) {
                            embedHelp.setDescription(command.data.options.description_localizations[language]!);
                        }
                        if (command.data.options.usage) {
                            embedHelp.addFields({ name: '❔ ' + this.client.t('main:args:help:embed:fields.title', { index: 0 }), value: `\`${command.data.options.usage[language]?.map((usage, index) => `**${index + 1}.** \`${prefix + command.data.options.name} ${usage}\`.`).join('\n')}\`` });
                        }
                        if (command.data.options.aliases) {
                            embedHelp.addFields({ name: '🔄 ' + this.client.t('main:args:help:embed:fields.title', { index: 1 }), value: `\`${command.data.options.aliases[language]?.join(', ')}\`` });
                        }

                        let currentEmbed = embedHelp;
                        const msg = await message.reply({ embeds: [embedHelp] });
                        await msg.react('❓');

                        const filter = (r: MessageReaction, u: User) => r.message.id === msg.id && u.id === message.author.id;
                        const collector = msg.createReactionCollector({ filter, time: 60000 });

                        collector.on('end', async () => {
                            await msg.reactions.removeAll();
                        });

                        collector.on('collect', async (reaction: MessageReaction) => {
                            if (reaction.emoji.name == '❓') {
                                const embedArgs = new ClientEmbed(this.client)
                                    .setTitle(this.client.t('main:args:how:embed.title'))
                                    .addFields(
                                        {
                                            name: this.client.t('main:args:how:embed:fields.title', { index: 0 }),
                                            value: this.client.t('main:args:how:embed:fields.values', { index: 0 })
                                        },
                                        {
                                            name: this.client.t('main:args:how:embed:fields.title', { index: 1 }),
                                            value: this.client.t('main:args:how:embed:fields.values', { index: 1 })
                                        });

                                if (currentEmbed == embedHelp) {
                                    await msg.edit({ embeds: [embedArgs] });
                                    currentEmbed = embedArgs;
                                } else {
                                    await msg.edit({ embeds: [embedHelp] });
                                    currentEmbed = embedHelp;
                                }
                            }
                            await reaction.users.remove(message.author.id);
                        });

                        return;
                    }

                    const checkPermissions = this.client.services.get('CheckPermissions');

                    const memberPermissions = await checkPermissions?.serviceExecute({ message, command, language });
                    if (!memberPermissions) return;

                    const clientPermissions = await checkPermissions?.serviceExecute({ message, command, language });
                    if (!clientPermissions) return;

                    await message.channel.sendTyping();

                    const commandPromise = async (resolve: (value: CommandStructure | PromiseLike<CommandStructure>) => void, reject: (reason?: any) => void) => {
                        try {
                            await command.commandExecute({ message, args, language, prefix });

                            resolve(command);
                        } catch (err) {
                            reject(err);
                        }
                    };

                    const commandExecute = new Promise<CommandStructure>(commandPromise);

                    await commandExecute
                        .catch(async (err: unknown) => {
                            try {
                                this.client.logger.error((err as Error).message, command.data.options.name);
                                this.client.logger.warn((err as Error).stack, command.data.options.name);

                                const errorChannel = new WebhookClient({ url: process.env.WEBHOOK_LOG_ERROR_URL });

                                const errorEmbed = new ClientEmbed(this.client)
                                    .setColor(Colors.Red)
                                    .setTitle(`Command: ${command.data.options.name}`)
                                    .setDescription('```js' + '\n' + ((err as Error).stack ?? (err as Error).message) + '\n' + '```');

                                await errorChannel.send({ embeds: [errorEmbed] });
                                return void message.reply({ content: this.client.t('main:errors.message', { index: 0 }) })
                                    .then((message) => setTimeout(() => message.delete(), 1000 * 10));
                            } catch (err) {
                                this.client.logger.error((err as Error).message, MessageCreateListener.name);
                                this.client.logger.warn((err as Error).stack, MessageCreateListener.name);
                            }
                        });

                    await commandExecute
                        .then(async () => {
                            try {
                                if (![process.env.OWNER_ID].includes(message.author.id) && message.channel) {
                                    const webHook = new WebhookClient({ url: process.env.WEBHOOK_LOG_COMMAND_URL });

                                    const whEmbed = new ClientEmbed(this.client)
                                        .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 4096 }))
                                        .setAuthor({ name: `${this.client.user?.username} Commands Log`, iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                        .addFields(
                                            {
                                                name: message.channel.type === ChannelType.DM ? 'DM:' : 'Guild:',
                                                value: message.channel.type === ChannelType.DM ? (`${message.author} \`(${message.author.id})\``) : (`\`${message.guild?.name}\` \`(${message.guild?.id})\``)
                                            },
                                            {
                                                name: 'Author:',
                                                value: `\`${message.author.tag}\` \`(${message.author.id})\``
                                            },
                                            {
                                                name: 'Command Type:',
                                                value: '`Prefix`'
                                            },
                                            {
                                                name: 'What was executed:',
                                                value: `**\`${prefix}${command.data.options.name} ${args.join(' ')}\`**`
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
                                    const { default: XPModule } = await import('../../Modules/XPModule');
                                    await new XPModule(this.client).moduleExecute({ message });
                                }
                            } catch (err) {
                                this.client.logger.error((err as Error).message, MessageCreateListener.name);
                                this.client.logger.warn((err as Error).stack, MessageCreateListener.name);
                            }
                        });
                }
            }

            //===============> Módulos <===============//

            if (message.guild) {
                //===============> AFK:
                const { default: afkModule } = await import('../../Modules/AFKModule');
                await new afkModule(this.client).moduleExecute(message);

                //===============> Anti-Convites:
                const { default: inviteModule } = await import('../../Modules/InviteModule');
                await new inviteModule(this.client).moduleExecute(message);

                //===============> Anti-Spam:
                const { default: spamModule } = await import('../../Modules/SpamModule');
                await new spamModule(this.client).moduleExecute(message);
            }

            //========================================//

        } catch (err) {
            this.client.logger.error((err as Error).message, MessageCreateListener.name);
            this.client.logger.warn((err as Error).stack, MessageCreateListener.name);
        }
    }
}