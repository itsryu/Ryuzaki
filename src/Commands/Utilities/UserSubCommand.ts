import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { UserSubCommandData } from '../../Data/Commands/Utilities/UserSubCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, User, GuildMember, MessageComponentInteraction, StringSelectMenuInteraction } from 'discord.js';
import { PermissionFlagKey, PermissionsFlagsText, UserBadges, UserFlagKey, UserFlagsText } from '../../Utils/Objects/flags';
import { Languages } from '../../Types/ClientTypes';
import { Util } from '../../Utils/util';
import { DiscordUser } from '../../Types/GatewayTypes';

interface UserBoostBadge {
    atualBadge?: string | null;
    atualBadgeTime?: number;
    nextBadge?: string;
    nextBadgeTime?: number;
};

export default class UserSubCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, UserSubCommandData);
    }

    async commandExecute({ message, args, language }: { message: Message, args: string[], language: Languages }) {
        try {
            switch (args[0]) {
                case 'image': {
                    const user = message.mentions?.users?.first() ?? await this.client.users.fetch(args[3]).catch(() => undefined) ?? message.author;

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
                                    const member = message.guild?.members.cache.get(user.id) ?? message.member;

                                    if (member) {
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
                    const user = message.mentions?.users?.first() ?? await this.client.users.fetch(args[1]).catch(() => undefined) ?? message.author;
                    const member = message.guild?.members.cache.get(user.id) ?? await message.guild?.members.fetch(user.id).catch(() => undefined);
                    const userData = await this.client.getData(user.id, 'user');
                    const pages: ClientEmbed[] = [];
                    let current = 0;

                    const data = await fetch((process.env.STATE === 'development' ? (process.env.LOCAL_URL + ':' + process.env.PORT) : (process.env.DOMAIN_URL)) + '/api/discord/user/' + user.id, {
                        headers: {
                            'Authorization': 'Bearer ' + process.env.AUTH_KEY
                        }
                    })
                        .then((res) => res.json())
                        .catch(() => undefined) as DiscordUser | undefined;

                    const flags = this.getUserFlags(user, language);
                    const badges = this.getUserBadges(data);
                    const boostBadge = this.getUserBoostBadge(data);

                    if (member) {
                        const permissions = this.getMemberPermissions(member, language);

                        const menuEmbed = new ClientEmbed(this.client)
                            .setThumbnail(user.displayAvatarURL({ size: 4096 }))
                            .setAuthor({ name: 'Informações do Usuário', iconURL: user.displayAvatarURL({ size: 4096 }) })
                            .setFields(
                                {
                                    name: 'Nickname:',
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

                        if (badges.length >= 1) {
                            menuEmbed.setDescription(`**Badges:** ${badges.join(' ')} ${boostBadge?.atualBadge ?? ''}`);
                        }

                        if (boostBadge?.atualBadge && boostBadge.atualBadgeTime) {
                            menuEmbed.addFields({ name: boostBadge.atualBadge + ' Boost atual', value: `\`${Util.formatDuration(boostBadge.atualBadgeTime, language)}\``, inline: false });
                            menuEmbed.addFields({ name: boostBadge.nextBadge ? (boostBadge.nextBadge + ' Boost Up:') : 'Boost Up:', value: boostBadge.nextBadgeTime ? `\`${Util.formatDuration(boostBadge.nextBadgeTime, language)}\`` : '\`Atingiu o limite!\`', inline: true });
                        }

                        if (userData && userData.call.totalCall > 0) {
                            const time = Util.formatDuration(userData.call.totalCall, language);
                            menuEmbed.addFields({ name: '🎙️ Tempo total em call\'s:', value: `**\`${time}\`**`, inline: false });
                        }

                        if (member.roles.cache.size > 1) {
                            const roles = member.roles.cache.filter((role) => role.id !== message.guild?.id).map((role) => role).join(' ');
                            menuEmbed.addFields({ name: '🔰 Cargos:', value: roles, inline: false });
                        }

                        pages.push(menuEmbed);

                        const embed = new ClientEmbed(this.client)
                            .setAuthor({ name: 'Informações do Usuário', iconURL: user.displayAvatarURL({ size: 4096 }) })
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

                        if (userData && userData.marry.has) {
                            const soul = await this.client.users.fetch(userData.marry.user).catch(() => undefined);
                            embed.addFields({ name: '💍 Casado(a):', value: `Casado(a) com \`${soul?.tag}\`.\nCasados desde <t:${Math.floor(userData.marry.time / 1000)}:f> (<t:${Math.floor(userData.marry.time / 1000)}:R>).` });
                        }

                        pages.push(embed);
                    } else {
                        const menuEmbed = new ClientEmbed(this.client)
                            .setThumbnail(user.displayAvatarURL({ size: 4096 }))
                            .setAuthor({ name: 'Informações do Usuário', iconURL: user.displayAvatarURL({ size: 4096 }) })
                            .setDescription(`**Badges:** ${badges.join(' ')} ${boostBadge?.atualBadge ?? ''}`)
                            .setFields(
                                {
                                    name: 'Nickname:',
                                    value: `\`${user.tag}\` \`(${user.id}\`)`,
                                    inline: true
                                },
                                {
                                    name: '📆 Data de Criação:',
                                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
                                    inline: true
                                }
                            );

                        if (badges.length >= 1) {
                            menuEmbed.setDescription(`**Badges:** ${badges.join(' ')} ${boostBadge?.atualBadge ?? ''}`);
                        }

                        if (boostBadge?.atualBadge && boostBadge.atualBadgeTime) {
                            menuEmbed.addFields({ name: boostBadge.atualBadge + ' Boost atual', value: `\`${Util.formatDuration(boostBadge.atualBadgeTime, language)}\``, inline: false });
                            menuEmbed.addFields({ name: boostBadge.nextBadge ? (boostBadge.nextBadge + ' Boost Up:') : 'Boost Up:', value: boostBadge.nextBadgeTime ? `\`${Util.formatDuration(boostBadge.nextBadgeTime, language)}\`` : '\`Atingiu o limite!\`', inline: true });
                        }

                        if (userData && userData.call.totalCall > 0) {
                            const time = Util.formatDuration(userData.call.totalCall, language);
                            menuEmbed.addFields({ name: '🎙️ Tempo total em call\'s:', value: `**\`${time}\`**`, inline: false });
                        }

                        pages.push(menuEmbed);

                        const embed = new ClientEmbed(this.client)
                            .setAuthor({ name: 'Informações do Usuário', iconURL: user.displayAvatarURL({ size: 4096 }) })
                            .setFields(
                                {
                                    name: '🚩 Flags:',
                                    value: flags.length >= 1 ? flags.map((flag) => `\`${flag}\``).join('\n') : '`Nenhuma`',
                                    inline: true
                                }
                            );

                        if (userData && userData.marry.has) {
                            const soul = await this.client.users.fetch(userData.marry.user).catch(() => undefined);
                            embed.addFields({ name: '💍 Casado(a):', value: `Casado(a) com \`${soul?.tag}\`.\nCasados desde <t:${Math.floor(userData.marry.time / 1000)}:f> (<t:${Math.floor(userData.marry.time / 1000)}:R>).` });
                        }

                        pages.push(embed);
                    }

                    const msg = await message.reply({ embeds: [pages[current]], components: [this.client.utils.button(1, current <= 0 ? true : false, pages.length <= 1 ? true : false)] });
                    const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                    const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 3 });

                    collector.on('end', async () => {
                        await msg.edit({ embeds: [pages[current].setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })], components: [this.client.utils.button(current + 1, true, true)] });
                    });

                    collector.on('collect', (i: StringSelectMenuInteraction) => {
                        if (i.customId === '-') current -= 1;
                        if (i.customId === '+') current += 1;

                        return void msg.edit({ embeds: [pages[current]], components: [this.client.utils.button(current + 1, current <= 0 ? true : false, current === pages.length - 1 ? true : false)] });
                    });
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, UserSubCommand.name);
            this.client.logger.warn((err as Error).stack, UserSubCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }

    private getUserFlags(user: User, language: Languages) {
        const flags = user.flags;

        if (flags) {
            return Object.entries(UserFlagsText)
                .filter(([flag]) => flags && flags.toArray().includes(flag as UserFlagKey))
                .map(([, text]) => text[language]);
        } else {
            return [];
        }
    }

    private getMemberPermissions(member: GuildMember, language: Languages): string[] {
        const permissions = member.permissions.toArray();

        return Object.entries(PermissionsFlagsText)
            .filter(([flag]) => permissions.includes(flag as PermissionFlagKey))
            .map(([, text]) => text[language]);
    }

    private getUserBadges(user: DiscordUser | undefined) {
        const badges = user?.badges;

        if (badges) {
            return Object.entries(UserBadges)
                .map(([badge, emoji]) => badges.map((b) => b.id).includes(badge as UserFlagKey) ? emoji : null)
                .filter(emoji => emoji !== null);
        } else {
            return [];
        }
    }

    private getMemberDevice(member: GuildMember): string {
        return member.presence?.clientStatus?.desktop
            ? '\`Desktop\`'
            : member.presence?.clientStatus?.mobile
                ? '\`Mobile\`'
                : member.presence?.clientStatus?.web
                    ? '\`Web\`'
                    : '\`Offline\`';
    }

    private getUserBoostBadge(user: DiscordUser | undefined): UserBoostBadge | undefined {
        const atualBoostDate = user?.premium_guild_since;

        if (atualBoostDate) {
            const atualBoostTimeMs = new Date(atualBoostDate).getTime();
            const calculatedAtualBoostTime = Date.now() - atualBoostTimeMs;

            switch (true) {
                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * 30): {
                    return {
                        atualBadge: '<:1Month:1252302212559015986>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:2Months:1252302325918335109>',
                        nextBadgeTime: calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * 30)
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * 60): {
                    return {
                        atualBadge: '<:2Months:1252302325918335109>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:3Months:1252302405572362466>',
                        nextBadgeTime: calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * 60)
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * 90): {
                    return {
                        atualBadge: '<:3Months:1252302405572362466>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:6Months:1252346325136314489>',
                        nextBadgeTime: calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * 90)
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * 270): {
                    return {
                        atualBadge: '<:6Months:1252346325136314489>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:9Months:1252346547996196937>',
                        nextBadgeTime: calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * 180)
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * 365): {
                    return {
                        atualBadge: '<:9Months:1252346547996196937>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:12Months:1252346695547752478>',
                        nextBadgeTime: calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * 270)
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * 547): {
                    return {
                        atualBadge: '<:12Months:1252346695547752478>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:18Months:1252346969355980820>',
                        nextBadgeTime: calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * 365)
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * 730): {
                    return {
                        atualBadge: '<:18Months:1252346969355980820>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:24Months:1252347148381589574>',
                        nextBadgeTime: calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * 547)
                    };
                }

                case calculatedAtualBoostTime > (1000 * 60 * 60 * 24 * 730): {
                    return {
                        atualBadge: '<:24Months:1252347148381589574>',
                        atualBadgeTime: calculatedAtualBoostTime
                    };
                }

                default: {
                    return {};
                }
            }
        } else {
            return undefined;
        }
    }
}