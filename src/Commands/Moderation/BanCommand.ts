import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { BanCommandData } from '../../Data/Commands/Moderation/BanCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, GuildTextBasedChannel, MessageComponentInteraction } from 'discord.js';
import { emojis } from '../../Utils/Objects/emojis.js';

export default class BanCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, BanCommandData);
    }

    public async commandExecute({ message, args }: { message: Message, args: string[] }): Promise<void> {
        const guildData = await this.client.getData(message.guild?.id, 'guild');
        const member = message.mentions?.members?.first() ?? await message.guild?.members.fetch(args[0]).catch(() => undefined);

        if (message.guild && message.member && message.guild.members.me) {
            if (!member) {
                return void message.reply({ content: this.client.t('moderation:ban:errors.noMember') });
            } else if (member.id === message.author.id) {
                return void  message.reply({ content: this.client.t('moderation:ban:errors.sameMember') });
            } else if (member.id === this.client.user?.id) {
                return void message.reply({ content: this.client.t('moderation:ban:errors.sameClient') });
            } else if (message.guild.members.me.roles.highest.position <= member.roles.highest.position) {
                return void message.reply({ content: this.client.t('moderation:ban:errors.clientPerms') });
            } else if (message.member.roles.highest.position <= member.roles.highest.position) {
                return void message.reply({ content: this.client.t('moderation:ban:errors.memberPerms') });
            } else if (!member.bannable) {
                return void message.reply({ content: this.client.t('moderation:ban:errors.bannable') });
            } else if (await message.guild.bans.fetch(member.id).catch(() => undefined)) {
                return void message.reply({ content: this.client.t('moderation:ban:errors.banned') });
            } else {
                const reason = args.slice(1).join(' ') || this.client.t('moderation:ban:errors.noReason');

                const buttonEmbed = new ClientEmbed(this.client)
                    .setAuthor({ name: this.client.t('moderation:ban:embeds:button.title'), iconURL: member.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                    .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                    .setDescription(this.client.t('moderation:ban:embeds:button.description', { author: message.author, member, reason }));

                const yesButton = new ButtonBuilder()
                    .setCustomId('yes')
                    .setLabel(this.client.t('moderation:ban:buttons:yesButton.label'))
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success);

                const noButton = new ButtonBuilder()
                    .setCustomId('no')
                    .setLabel(this.client.t('moderation:ban:buttons:noButton.label'))
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(yesButton, noButton);
                const msg = await message.reply({ embeds: [buttonEmbed], components: [row] });
                const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                const collector = msg.createMessageComponentCollector({ filter, time: 60000, max: 1 });

                collector.on('end', (collected) => {
                    if (collected.size === 0) {
                        const collectors = [yesButton, noButton];
                        collectors.forEach((c) => c.setDisabled(true));
                        buttonEmbed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });

                        msg.edit({ embeds: [buttonEmbed], components: [row] });
                    }
                });

                collector.on('collect', (interaction: ButtonInteraction) => {
                    if (interaction.customId === 'yes') {
                        const bannedEmbed = new ClientEmbed(this.client)
                            .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                            .setTitle(this.client.t('moderation:ban:embeds:banned.title'))
                            .setDescription(this.client.t('moderation:ban:embeds:banned.description', { member: member.user.username, guild: message.guild?.name, reason, author: message.author.tag }));

                        const banEmbed = new ClientEmbed(this.client)
                            .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                            .addFields(
                                {
                                    name: this.client.t('moderation:ban:embeds:ban.fields', { index: 0, emoji: emojis.info }),
                                    value: this.client.t('moderation:ban:embeds:ban.values', { index: 0 })
                                },
                                {
                                    name: this.client.t('moderation:ban:embeds:ban.fields', { index: 1, emoji: emojis.membro }),
                                    value: `\`${member.user.tag}\` \`(${member.user.id})\``,
                                    inline: true
                                },
                                {
                                    name: this.client.t('moderation:ban:embeds:ban.fields', { index: 2 }),
                                    value: `\`${message.author.tag}\` \`(${message.author.id})\``
                                },
                                {
                                    name: this.client.t('moderation:ban:embeds:ban.fields', { index: 3 }),
                                    value: `\`${reason}\``
                                });

                        member.ban({ reason: reason, deleteMessageSeconds: 604800 })
                            .then(() => {
                                member.send({ embeds: [bannedEmbed] }).catch(() => { });

                                if (guildData && guildData.logs.status && guildData.logs.moderation) {
                                    const channel = message.guild?.channels.cache.get(guildData.logs.channel) as GuildTextBasedChannel;
                                    if (channel) channel.send({ embeds: [banEmbed] });
                                }

                                msg.edit({ embeds: [banEmbed], components: [] });
                            })
                            .catch(() => {
                                msg.edit({ content: this.client.t('moderation:ban:errors.failed'), embeds: [], components: [] });
                            });
                    }

                    if (interaction.customId === 'no') {
                        msg.edit({ content: this.client.t('moderation:ban:errors.rejected', { member: member.user.tag }), embeds: [], components: [] });
                    }
                });
            }
        }
    }
}