import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { UserSubCommandData } from '../../Data/Commands/Utilities/UserSubCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, User, GuildMember, MessageComponentInteraction, StringSelectMenuInteraction } from 'discord.js';
import { PermissionFlagKey, PermissionsFlagsText, UserFlagKey, UserFlagsText } from '../../Utils/Objects/flags';
import { Languages } from '../../Types/ClientTypes';
import { Util } from '../../Utils/util';

export default class UserSubCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, UserSubCommandData);
    }

    async commandExecute({ message, args, language }: { message: Message, args: string[], language: Languages }) {
        switch (args[0]) {
            case 'image': {
                const user = message.mentions?.users.first() ?? await this.client.users.fetch(args[3]).catch(() => undefined) ?? message.author;

                switch (args[1]) {
                    case 'avatar': {

                        switch (args[2]) {
                            case 'user': {
                                const avatar = user.displayAvatarURL({ extension: 'png', size: 4096 });

                                const embed = new ClientEmbed(this.client)
                                    .setTitle(this.client.t('utilities:avatar.title'))
                                    .addFields({ name: this.client.t('utilities:avatar.field'), value: `\`${user.username}\``, inline: true })
                                    .setImage(avatar);

                                const button = new ButtonBuilder()
                                    .setEmoji('🔗')
                                    .setLabel(this.client.t('utilities:avatar.button'))
                                    .setURL(avatar)
                                    .setStyle(ButtonStyle.Link);

                                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                                return void message.reply({ embeds: [embed], components: [row] });
                            }

                            case 'guild': {
                                const member = message.guild?.members.cache.get(user.id)!;
                                const avatar = member.displayAvatarURL({ extension: 'png', size: 4096 });

                                const embed = new ClientEmbed(this.client)
                                    .setTitle(this.client.t('utilities:avatar.title'))
                                    .addFields({ name: this.client.t('utilities:avatar.field'), value: `\`${member.user.username}\``, inline: true })
                                    .setImage(avatar);

                                const button = new ButtonBuilder()
                                    .setEmoji('🔗')
                                    .setLabel(this.client.t('utilities:avatar.button'))
                                    .setURL(avatar)
                                    .setStyle(ButtonStyle.Link);

                                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                                return void message.reply({ embeds: [embed], components: [row] });
                            }
                        }
                        break;
                    }

                    case 'banner': {
                        switch (args[2]) {
                            case 'user': {
                                return void user.fetch()
                                    .then((user) => {
                                        const banner = user.bannerURL({ extension: 'png', size: 4096 });

                                        if (!banner) {
                                            return void message.reply(this.client.t('utilities:banner:errors.!banner'));
                                        } else {
                                            const embed = new ClientEmbed(this.client)
                                                .setTitle(this.client.t('utilities:banner.title'))
                                                .addFields({ name: this.client.t('utilities:banner.field'), value: `\`${user.username}\``, inline: true })
                                                .setImage(banner);

                                            const button = new ButtonBuilder()
                                                .setEmoji('🔗')
                                                .setLabel(this.client.t('utilities:banner.button'))
                                                .setURL(banner)
                                                .setStyle(ButtonStyle.Link);

                                            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                                            return void message.reply({ embeds: [embed], components: [row] });
                                        }
                                    });
                            }
                        }
                    }
                }
                break;
            }

            case 'info': {
                const user = message.mentions?.users.first() ?? await this.client.users.fetch(args[1]).catch(() => undefined) ?? message.author;
                const member = message.guild?.members.cache.get(user.id) ?? await message.guild?.members.fetch(user.id).catch(() => undefined);
                const userData = await this.client.getData(user.id, 'user');
                const URL = process.env.STATE === 'development' ? (process.env.LOCAL_URL + ':' + process.env.PORT) : process.env.DOMAIN_URL;
                const pages: ClientEmbed[] = [];
                let current = 0;

                const flags = await this.getUserFlags(user, language);
                const data = await fetch(URL + '/discord/user/' + user.id)
                    .then((res) => res.json())
                    .catch(() => { });

                console.log(data);

                if (member) {
                    // É um membro do servidor:
                    const permissions = this.getMemberPermissions(member, language);

                    const menuEmbed = new ClientEmbed(this.client)
                        .setThumbnail(user.displayAvatarURL({ size: 4096 }))
                        .setAuthor({ name: `Informações do Usuário`, iconURL: user.displayAvatarURL({ size: 4096 }) })
                        .setFields(
                            {
                                name: `Nickname:`,
                                value: `\`${member.user.tag}\` \`(${member.id})\``,
                                inline: true
                            },
                            {
                                name: '📆 Data de Criação:',
                                value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
                                inline: true
                            },
                            {
                                name: '📱 Dispositivo:',
                                value: this.getMemberDevice(member),
                                inline: false
                            }
                        );

                    if (member.roles.cache.size > 1) {
                        const roles = member.roles.cache.filter((role) => role.id !== message.guild?.id).map((role) => role).join(' ');
                        console.log(roles);

                        menuEmbed.addFields({ name: '🔰 Cargos:', value: roles, inline: false });
                    }

                    if (userData.call.totalCall > 0) {
                        const time = Util.formatDuration(userData.call.totalCall);
                        menuEmbed.addFields({ name: '🎙️ Tempo total em call\'s:', value: `**\`${time}\`**`, inline: true });
                    }

                    pages.push(menuEmbed);

                    const embed = new ClientEmbed(this.client)
                        .setAuthor({ name: `Informações do Usuário`, iconURL: user.displayAvatarURL({ size: 4096 }) })
                        .setFields(
                            {
                                name: '🛡️ Permissões:',
                                value: permissions.length >= 1 ? permissions.map((permission) => `\`${permission}\``).join('\n') : '`Nenhuma`',
                                inline: true
                            },
                            {
                                name: '🚩 Flags:',
                                value: flags.length >= 1 ? flags.map((flag) => `\`${flag}\``).join('\n') : '`Nenhuma`',
                                inline: true
                            }
                        );

                    if (userData.marry.has) {
                        const soul = await this.client.users.fetch(userData.marry.user).catch(() => undefined);
                        embed.addFields({ name: '💍 Casado(a):', value: `\`Casado(a) com ${soul?.tag}.\nCasados desde <t:${Math.floor(userData.marry.time / 1000)}:f> (<t:${Math.floor(userData.marry.time / 1000)}:R>).` });
                    }

                    pages.push(embed);
                } else {
                    // Não é um membro do servidor:
                    const menuEmbed = new ClientEmbed(this.client)
                        .setThumbnail(user.displayAvatarURL({ size: 4096 }))
                        .setAuthor({ name: `Informações do Usuário`, iconURL: user.displayAvatarURL({ size: 4096 }) })
                        .setFields(
                            {
                                name: `Username:`,
                                value: `\`${user.tag}\` \`(${user.id}\`)`,
                                inline: true
                            },
                            {
                                name: '📆 Data de Criação:',
                                value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
                                inline: true
                            }
                        );

                    if (userData.call.totalCall > 0) {
                        const time = Util.formatDuration(userData.call.totalCall);
                        menuEmbed.addFields({ name: '🎙️ Tempo total em call\'s:', value: `**\`${time}\`**`, inline: true });
                    }

                    pages.push(menuEmbed);

                    const embed = new ClientEmbed(this.client)
                        .setAuthor({ name: `Informações do Usuário`, iconURL: user.displayAvatarURL({ size: 4096 }) })
                        .setFields(
                            {
                                name: '🚩 Flags:',
                                value: flags.length >= 1 ? flags.map((flag) => `\`${flag}\``).join('\n') : '`Nenhuma`',
                                inline: true
                            }
                        );

                    if (userData.marry.has) {
                        const soul = await this.client.users.fetch(userData.marry.user).catch(() => undefined);
                        embed.addFields({ name: '💍 Casado(a):', value: `\`Casado(a) com ${soul?.tag}.\nCasados desde <t:${Math.floor(userData.marry.time / 1000)}:f> (<t:${Math.floor(userData.marry.time / 1000)}:R>).` });
                    }

                    pages.push(embed);
                }

                const msg = await message.reply({ embeds: [pages[current]], components: [this.client.utils.button(1, current <= 0 ? true : false, pages.length <= 1 ? true : false)] });
                const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 3 });

                collector.on('end', () => {
                    msg.edit({ embeds: [pages[current].setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })], components: [this.client.utils.button(current + 1, true, true)] });
                });

                collector.on('collect', (i: StringSelectMenuInteraction) => {
                    if (i.customId === '-') current -= 1;
                    if (i.customId === '+') current += 1;

                    return void void msg.edit({ content: `Página: ${current + 1}/${pages.length}`, embeds: [pages[current]], components: [this.client.utils.button(current + 1, current <= 0 ? true : false, current === pages.length - 1 ? true : false)] });
                });

                return void message.reply('.');
            }
        }
    }

    private async getUserFlags(user: User, language: Languages): Promise<string[]> {
        const flags = await user.fetchFlags();

        return Object.entries(UserFlagsText)
            .filter(([flag]) => flags.toArray().includes(flag as UserFlagKey))
            .map(([, text]) => text[language]);
    }

    private getMemberPermissions(member: GuildMember, language: Languages): string[] {
        const permissions = member.permissions.toArray();

        return Object.entries(PermissionsFlagsText)
            .filter(([flag]) => permissions.includes(flag as PermissionFlagKey))
            .map(([, text]) => text[language]);
    }

    public getMemberDevice(member: GuildMember): string {
        return member.presence?.clientStatus?.desktop
            ? '\`Desktop\`'
            : member.presence?.clientStatus?.mobile
                ? '\`Mobile\`'
                : member.presence?.clientStatus?.web
                    ? '\`Web\`'
                    : '\`Offline\`';
    }
}