﻿import { KickCommandData } from '../../data/commands/moderation/kickCommandData';
import { Ryuzaki } from '../../ryuzakiClient';
import { ClientEmbed, CommandStructure } from '../../structures';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, GuildTextBasedChannel, Message, MessageComponentInteraction, OmitPartialGroupDMChannel } from 'discord.js';
import { emojis } from '../../utils/objects';
import { Logger } from '../../utils';

export default class KickCommand extends CommandStructure {
    public constructor(client: Ryuzaki) {
        super(client, KickCommandData);
    }

    public async commandExecute({ message, args }: { message: OmitPartialGroupDMChannel<Message>, args: string[] }): Promise<void> {
        try {
            const guildData = await this.client.getData(message.guild?.id, 'guild');
            const member = message.mentions?.members?.first() ?? await message.guild?.members.fetch(args[0]).catch(() => undefined);

            if (message.guild && message.member && message.guild.members.me) {
                if (!member) {
                    return void message.reply({ content: this.client.t('moderation:kick:errors.noMember') });
                } else if (member.id === message.author.id) {
                    return void message.reply({ content: this.client.t('moderation:kick:errors.sameMember') });
                } else if (member.id === this.client.user?.id) {
                    return void message.reply({ content: this.client.t('moderation:kick:errors.sameClient') });
                } else if (message.guild.members.me.roles.highest.position <= member.roles.highest.position) {
                    return void message.reply({ content: this.client.t('moderation:kick:errors.clientPerms') });
                } else if (message.member.roles.highest.position <= member.roles.highest.position) {
                    return void message.reply({ content: this.client.t('moderation:kick:errors.memberPerms') });
                } else if (!member.kickable) {
                    return void message.reply({ content: this.client.t('moderation:kick:errors.bannable') });
                } else {
                    const reason = args.slice(1).join(' ') || this.client.t('');

                    const buttonEmbed = new ClientEmbed(this.client)
                        .setAuthor({ name: this.client.t('moderation:kick:embeds:button.title'), iconURL: member.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                        .setDescription(this.client.t('moderation:kick:embeds:button.description', { author: message.author, member, reason }));

                    const yesButton = new ButtonBuilder()
                        .setCustomId('yes')
                        .setLabel(this.client.t('moderation:kick:buttons:yesButton.label'))
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Success);

                    const noButton = new ButtonBuilder()
                        .setCustomId('no')
                        .setLabel(this.client.t('moderation:kick:buttons:noButton.label'))
                        .setEmoji('❌')
                        .setStyle(ButtonStyle.Danger);

                    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(yesButton, noButton);
                    const msg = await message.reply({ embeds: [buttonEmbed], components: [row] });
                    const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                    const collector = msg.createMessageComponentCollector({ filter, time: 60000, max: 1 });

                    collector.on('end', async (collected) => {
                        if (collected.size === 0) {
                            const collectors = [yesButton, noButton];
                            collectors.forEach((c) => c.setDisabled(true));
                            buttonEmbed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });

                            await msg.edit({ embeds: [buttonEmbed], components: [row] });
                        }
                    });

                    collector.on('collect', async (interaction: ButtonInteraction) => {
                        if (interaction.customId === 'yes') {
                            const kickedEmbed = new ClientEmbed(this.client)
                                .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                                .setTitle(this.client.t('moderation:kick:embeds:banned.title'))
                                .setDescription(this.client.t('moderation:kick:embeds:banned.description', { member: member.user.username, guild: message.guild?.name, reason, author: message.author.tag }));

                            const kickEmbed = new ClientEmbed(this.client)
                                .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                                .addFields(
                                    {
                                        name: this.client.t('moderation:kick:embeds:kick.fields', { index: 0, emoji: emojis.info }),
                                        value: this.client.t('moderation:kick:embeds:kick.values', { index: 0 })
                                    },
                                    {
                                        name: this.client.t('moderation:kick:embeds:kick.fields', { index: 1, emoji: emojis.membro }),
                                        value: `\`${member.user.tag}\` \`(${member.user.id})\``,
                                        inline: true
                                    },
                                    {
                                        name: this.client.t('moderation:kick:embeds:kick.fields', { index: 2 }),
                                        value: `\`${message.author.tag}\` \`(${message.author.id})\``
                                    },
                                    {
                                        name: this.client.t('moderation:kick:embeds:kick.fields', { index: 3 }),
                                        value: `\`${reason}\``
                                    });

                            member.kick(reason)
                                .then(async () => {
                                    await member.send({ embeds: [kickedEmbed] }).catch();

                                    if (guildData && guildData.logs.status && guildData.logs.moderation) {
                                        const channel = message.guild?.channels.cache.get(guildData.logs.channel) as GuildTextBasedChannel;
                                        if (channel) await channel.send({ embeds: [kickEmbed] });
                                    }

                                    await msg.edit({ embeds: [kickEmbed], components: [] });
                                })
                                .catch(async () => {
                                    await msg.edit({ content: this.client.t('moderation:kick:errors.failed'), embeds: [], components: [] });
                                });
                        }

                        if (interaction.customId === 'no') {
                            await msg.edit({ content: this.client.t('moderation:kick:errors.rejected', { member: member.user.tag }), embeds: [], components: [] });
                        }
                    });
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, KickCommand.name);
            Logger.warn((err as Error).stack, KickCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}