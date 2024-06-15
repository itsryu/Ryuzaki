import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../Structures';
import { Message, Collection, WebhookClient, PermissionFlagsBits, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, User, MessageReaction, Colors, GuildChannel } from 'discord.js';
import { emojis } from '../../Utils/Objects/emojis';

export default class messageCreateListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.MessageCreate
        });
    }

    async eventExecute(message: Message): Promise<void> {
        if (message.author.bot || !message.guild) return;

        try {
            const client = await this.client.getData(this.client.user?.id, 'client');
            const server = await this.client.getData(message.guild.id, 'guild');
            const prefix = server.prefix ?? process.env.PREFIX;

            //===============> Módulo de tradução <===============//

            const language = await this.client.getLanguage(message.guild.id);
            await this.client.getTranslate(message.guild.id);

            //===============> Menções <===============//

            if (!(message.channel as GuildChannel).permissionsFor(message.guild.members.me!).has(PermissionFlagsBits.SendMessages)) {
                return void message.member?.send({ content: this.client.t('main:permissions.alert', { index: 3, member: message.member }) })
                    .catch(() => undefined);
            }

            // Se mencionar o BOT:
            if (message.content.match(this.client.utils.GetMention(this.client.user?.id!))) {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setURL('https://github.com/JauumVictor/Ryuzaki')
                            .setStyle(ButtonStyle.Link)
                            .setEmoji(emojis.github)
                            .setLabel(this.client.t('main:mentions:button.github')),
                        new ButtonBuilder()
                            .setURL(this.client.url)
                            .setStyle(ButtonStyle.Link)
                            .setEmoji(emojis.pin)
                            .setLabel(this.client.t('main:mentions:button.add')),
                        new ButtonBuilder()
                            .setURL('https://discord.gg/Y3aS5VwcNV')
                            .setStyle(ButtonStyle.Link)
                            .setEmoji(emojis.partner)
                            .setLabel(this.client.t('main:mentions:button.support'))
                    );

                return void message.reply({ content: this.client.t('main:mentions.client', { author: message.author, name: this.client.user?.username, prefix: prefix }), components: [row] });
            }

            //===============> Exportações de Comandos <===============//

            if (message.content.startsWith(prefix)) {
                const [name, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
                const command = this.client.commands.get(name) ?? this.client.commands.find((command) => command.data.options.aliases ? command.data.options.aliases[language] && command.data.options.aliases[language].includes(name) : undefined);

                if (!command) {
                    if (message.content === prefix) return;

                    const searchCommand = this.client.commands.find((command) => new RegExp(name, 'i').test(command.data.options.name));

                    if (!searchCommand) {
                        return void message.reply({ content: this.client.t('main:errors.message', { index: 1, command: name }) })
                            .then((message) => setTimeout(() => message.delete(), 1000 * 15));
                    }

                    const command = searchCommand.data.options.name;

                    return void message.reply({ content: this.client.t('main:errors.message', { index: 2, command, prefix }) })
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
                            return void message.reply({ content: this.client.t('main:cooldown.reply', { time: timeLeft.toFixed(1), command: command.data.options.name }) }).catch(() => undefined);
                        }
                    }

                    //============================================//

                    const cmdDb = await this.client.getData(command.data.options.name, 'command');

                    const mainCmd = new ClientEmbed(this.client)
                        .setAuthor({ name: this.client.t('main:maintenance:command:embed.title', { command: command.data.options.name.replace(/^\w/, (c) => c.toUpperCase()) }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(this.client.t('main:maintenance:command:embed.description', { command: command.data.options.name, reason: cmdDb.reason }));

                    const mainBot = new ClientEmbed(this.client)
                        .setAuthor({ name: this.client.t('main:maintenance:client:embed.title', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(this.client.t('main:maintenance:client:embed.description', { reason: client.reason }));

                    if (!this.client.developers.includes(message.author.id)) {
                        timestamps?.set(message.author.id, now);
                        setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);

                        if (server.cmdblock.status) {
                            if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
                                if (server.cmdblock.cmds.some((x) => x === command.data.options.name || server.cmdblock.channels.some((x) => x === message.channel.id))) {
                                    return void message.reply({ content: server.cmdblock.msg.replace(/{member}/g, `<@${message.author.id}>`).replace(/{channel}/g, `<#${message.channel.id}>`).replace(/{command}/g, command.data.options.name) })
                                        .then((sent) => setTimeout(() => sent.delete(), 10000))
                                        .catch((err) => { this.client.logger.warn(err.stack, messageCreateListener.name); });
                                }
                            }
                        }

                        if (cmdDb.maintenance) {
                            return void message.reply({ embeds: [mainCmd] });
                        } else if (client.maintenance) {
                            return void message.reply({ embeds: [mainBot] });
                        } else if (client.blacklist.some((x) => x == message.author.id)) {
                            return void message.reply({ content: this.client.t('main:blacklist.user', { user: message.author }) });
                        }
                    }

                    if (command.data.options.config.devOnly && !this.client.developers.some((id) => [id].includes(message.author.id))) {
                        return void message.reply({ content: this.client.t('main:owner.reply', { client: this.client.user?.username }) });
                    }

                    if (command.data.options.config.args && !args.length) {
                        const embedHelp = new ClientEmbed(this.client)
                            .setAuthor({ name: prefix + command.data.options.name, iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setThumbnail(this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) ?? null);

                        if (command.data.options.description) {
                            embedHelp.setDescription((command.data.options.description_localizations as object)[language]);
                        }
                        if (command.data.options.usage) {
                            embedHelp.addFields({ name: '❔ ' + this.client.t('main:args:help:embed:fields.title', { index: 0 }), value: command.data.options.usage[language].length ? command.data.options.usage[language].map((usage, index) => `**${index + 1}.** \`${prefix + command.data.options.name} ${usage}\`.`).join('\n') : `\`${prefix + command.data.options.name}\`` });
                        }
                        if (command.data.options.aliases) {
                            embedHelp.addFields({ name: '🔄 ' + this.client.t('main:args:help:embed:fields.title', { index: 1 }), value: `\`${command.data.options.aliases[language].join(', ')}\`` });
                        }

                        let currentEmbed = embedHelp;
                        const msg = await message.reply({ embeds: [embedHelp] });
                        msg.react('❓');

                        const filter = (reaction: MessageReaction, user: User) => reaction && user.id === message.author.id;
                        const collector = msg.createReactionCollector({ filter, time: 60000 });

                        collector.on('end', () => {
                            msg.reactions.removeAll();
                        });

                        collector.on('collect', (reaction: MessageReaction) => {
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
                                    msg.edit({ embeds: [embedArgs] });
                                    currentEmbed = embedArgs;
                                } else {
                                    msg.edit({ embeds: [embedHelp] });
                                    currentEmbed = embedHelp;
                                }
                            }
                            reaction.users.remove(message.author.id);
                        });
                        return;
                    }

                    const checkPermissions = this.client.services.get('checkPermissions');

                    const memberPermissions = checkPermissions?.serviceExecute({ message, command, language });
                    if (!memberPermissions) return;

                    const clientPermissions = checkPermissions?.serviceExecute({ message, command, language });
                    if (!clientPermissions) return;

                    await message.channel.sendTyping();

                    const commandPromise = async (resolve: (value: void) => void, reject: (reason?: any) => void) => {
                        try {
                            resolve(await command.commandExecute({ message, args, language, prefix }));
                        } catch (err) {
                            reject(err);
                        }
                    }

                    const commandExecute = new Promise(commandPromise);

                    commandExecute.catch((err) => {
                        this.client.logger.error(err.message, command.data.options.name);
                        this.client.logger.warn(err.stack, command.data.options.name);

                        const errorChannel = new WebhookClient({ url: process.env.WEBHOOK_LOG_ERROR_URL });

                        const errorEmbed = new ClientEmbed(this.client)
                            .setColor(Colors.Red)
                            .setTitle(`Command: ${command.data.options.name}`)
                            .setDescription('```js' + '\n' + err.stack + '\n' + '```');

                        errorChannel.send({ embeds: [errorEmbed] });
                        return void message.reply({ content: this.client.t('main:errors.message', { index: 0 }) })
                            .then((message) => setTimeout(() => message.delete(), 1000 * 10));
                    });

                    commandExecute.then(() => {
                        if (![process.env.OWNER_ID].includes(message.author.id) && message.guild) {
                            const webHook = new WebhookClient({ url: process.env.WEBHOOK_LOG_COMMAND_URL });

                            const whEmbed = new ClientEmbed(this.client)
                                .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 4096 }))
                                .setAuthor({ name: `${this.client.user?.username} Commands Log`, iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                .addFields(
                                    {
                                        name: 'Guild:',
                                        value: `\`${message.guild.name}\` \`(${message.guild.id})\``
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

                            webHook.send({ embeds: [whEmbed] });
                        }

                        const num = cmdDb.usages;

                        cmdDb.updateOne({ $set: { usages: num + 1 } });
                    });
                }
            }

            //===============> Módulos <===============//

            //===============> AFK:
            const { default: afkModule } = await import('../../Modules/afkModule');
            new afkModule(this.client).moduleExecute(message);

            //===============> Levels:
            const { default: xpModule } = await import('../../Modules/xpModule');
            new xpModule(this.client).moduleExecute(message);

            //===============> Anti-Invites:
            const { default: inviteModule } = await import('../../Modules/inviteModule');
            new inviteModule(this.client).moduleExecute(message);

            //===============> Anti-Spam:
            const { default: spamModule } = await import('../../Modules/spamModule');
            new spamModule(this.client).moduleExecute(message);

            //========================================//

        } catch (err) {
            this.client.logger.error((err as Error).message, messageCreateListener.name);
            this.client.logger.warn((err as Error).stack!, messageCreateListener.name);
        }
    }
}