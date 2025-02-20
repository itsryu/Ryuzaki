import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure, ClientEmbed } from '../../structures';
import { UserSubCommandData } from '../../data/commands/utilities/userSubCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, User, GuildMember, MessageComponentInteraction, StringSelectMenuInteraction, OmitPartialGroupDMChannel } from 'discord.js';
import { Language, PermissionFlagKey, PermissionsFlagsText, UserFlagKey, UserFlagsText } from '../../utils/objects';
import { Logger, Util, GetDiscordUserApiData } from '../../utils';

export default class UserSubCommand extends CommandStructure {
    public constructor(client: Ryuzaki) {
        super(client, UserSubCommandData);
    }

    public async commandExecute({ message, args, language }: { message: OmitPartialGroupDMChannel<Message>, args: string[], language: Language }) {
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

                    const data = await GetDiscordUserApiData.getUserData(user.id);
                    const flags = UserSubCommand.getUserFlags(user, language);
                    const badges = GetDiscordUserApiData.getUserBadges(data);
                    const boostBadge = GetDiscordUserApiData.getUserBoostBadge(data);

                    const menuEmbed = new ClientEmbed(this.client)
                        .setThumbnail(user.displayAvatarURL({ size: 4096 }))
                        .setAuthor({ name: 'Informações do Usuário', iconURL: user.displayAvatarURL({ size: 4096 }) })
                        .addFields(
                            {
                                name: 'Nickname:',
                                value: `\`${user.tag}\` \`(${user.id}\`)`,
                                inline: true
                            },
                            {
                                name: '📆 Data de Criação:',
                                value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
                                inline: true
                            });

                    const embed = new ClientEmbed(this.client)
                        .setAuthor({ name: 'Informações do Membro', iconURL: user.displayAvatarURL({ size: 4096 }) })
                        .setFields(
                            {
                                name: '🚩 Flags:',
                                value: flags.length >= 1 ? flags.map((flag) => `\`${flag}\``).join('\n') : '`Nenhuma`',
                                inline: true
                            }
                        );

                    if (badges.length >= 1) {
                        menuEmbed.setDescription(`**Badges:** ${badges.join(' ')} ${boostBadge?.atualBadge ?? ''}`);
                    }

                    if (boostBadge?.atualBadge && boostBadge.atualBadgeTime) {
                        menuEmbed.addFields({ name: boostBadge.atualBadge + ' Boost atual', value: `\`${Util.formatDuration(boostBadge.atualBadgeTime, language)}\` (<t:${Math.floor((Date.now() - boostBadge.atualBadgeTime) / 1000)}:R>)`, inline: false });
                        menuEmbed.addFields({ name: boostBadge.nextBadge ? (boostBadge.nextBadge + ' Boost Up:') : 'Boost Up:', value: boostBadge.nextBadgeTime ? `\`${Util.formatDuration(boostBadge.nextBadgeTime, language)}\` (<t:${Math.floor((Date.now() + boostBadge.nextBadgeTime) / 1000)}:R>)` : '`Atingiu o limite!`', inline: true });
                    }

                    if (userData && userData.call.totalCall > 0) {
                        const time = Util.formatDuration(userData.call.totalCall, language);
                        menuEmbed.addFields({ name: '🎙️ Tempo total em call\'s:', value: `**\`${time}\`**`, inline: false });
                    }

                    if (userData && userData.marry.has) {
                        const soul = await this.client.users.fetch(userData.marry.user).catch(() => undefined);
                        menuEmbed.addFields({ name: '💍 Casado(a):', value: `Casado(a) com \`${soul?.tag}\`.\nCasados desde <t:${Math.floor(userData.marry.time / 1000)}:f> (<t:${Math.floor(userData.marry.time / 1000)}:R>).` });
                    }

                    if (member) {
                        const permissions = UserSubCommand.getMemberPermissions(member, language);

                        menuEmbed
                            .addFields(
                                {
                                    name: '📱 Dispositivo:',
                                    value: UserSubCommand.getMemberDevice(member),
                                    inline: false
                                }
                            );

                        if (member.roles.cache.size > 1) {
                            const roles = member.roles.cache.filter((role) => role.id !== message.guild?.id).map((role) => role).join(' ');
                            menuEmbed.addFields({ name: '🔰 Cargos:', value: roles, inline: false });
                        }

                        embed
                            .setFields(
                                {
                                    name: '🛡️ Permissões:',
                                    value: permissions.length >= 1 ? permissions.map((permission) => `\`${permission}\``).join('\n') : '`Nenhuma`',
                                    inline: true
                                }
                            );
                    }

                    pages.push(menuEmbed);
                    pages.push(embed);

                    const msg = await message.reply({ embeds: [pages[current]], components: [Util.button(1, current <= 0 ? true : false, pages.length <= 1 ? true : false)] });
                    const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                    const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 3 });

                    collector.on('end', async () => {
                        await msg.edit({ embeds: [pages[current].setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })], components: [Util.button(current + 1, true, true)] });
                    });

                    collector.on('collect', (i: StringSelectMenuInteraction) => {
                        if (i.customId === '-') current -= 1;
                        if (i.customId === '+') current += 1;

                        return void msg.edit({ embeds: [pages[current]], components: [Util.button(current + 1, current <= 0 ? true : false, current === pages.length - 1 ? true : false)] });
                    });
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, UserSubCommand.name);
            Logger.warn((err as Error).stack, UserSubCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }

    private static getUserFlags(user: User, language: Language) {
        const flags = user.flags;

        if (flags) {
            return Object.entries(UserFlagsText)
                .filter(([flag]) => flags.toArray().includes(flag as UserFlagKey))
                .map(([, text]) => text[language]);
        } else {
            return [];
        }
    }

    private static getMemberPermissions(member: GuildMember, language: Language): string[] {
        const permissions = member.permissions.toArray();

        return Object.entries(PermissionsFlagsText)
            .filter(([flag]) => permissions.includes(flag as PermissionFlagKey))
            .map(([, text]) => text[language]);
    }



    private static getMemberDevice(member: GuildMember): string {
        return member.presence?.clientStatus?.desktop
            ? '`Desktop`'
            : member.presence?.clientStatus?.mobile
                ? '`Mobile`'
                : member.presence?.clientStatus?.web
                    ? '`Web`'
                    : '`Offline`';
    }
}