import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, ListenerStructure } from '../../Structures';
import { ActionRowBuilder, AuditLogEvent, ButtonBuilder, ButtonInteraction, ButtonStyle, Events, Guild, GuildAuditLogsEntry, GuildTextBasedChannel, MessageComponentInteraction, NonThreadGuildBasedChannel } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class GuildAuditLogEntryCreateListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.GuildAuditLogEntryCreate
        });
    }

    public async eventExecute(auditLogEntry: GuildAuditLogsEntry, guild: Guild): Promise<void> {
        try {
            if (guild && guild.id === '1110360854219739156') {
                const { action, executorId, targetId, target, changes } = auditLogEntry;
                const logChannel = await this.client.channels.fetch('1251699570698883155').catch(() => null) as GuildTextBasedChannel;

                switch (action) {
                    case AuditLogEvent.ChannelDelete: {
                        const executor = await this.client.users.fetch(executorId!).catch(() => null);
                        const channel = target as NonThreadGuildBasedChannel;

                        if (executor && channel) {
                            const embed = new ClientEmbed(this.client)
                                .setTitle('Channel Deleted')
                                .setDescription(`Channel ${channel.name} was deleted by ${executor} (${executor.id}) on ${guild.name}.`);

                            const button = new ButtonBuilder()
                                .setStyle(ButtonStyle.Secondary)
                                .setLabel('Recreate Channel')
                                .setCustomId('recreate-channel')
                                .setEmoji('🔁');

                            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                            const msg = await logChannel.send({ embeds: [embed], components: [row] });
                            const filter = (i: MessageComponentInteraction) => (i.user.id === '1110284870875361350' && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                            const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 3 });

                            collector.on('end', async () => {
                                button.setDisabled(true);
                                return void await msg.edit({ embeds: [embed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })], components: [row] });
                            });

                            collector.on('collect', async (i: ButtonInteraction) => {
                                const newChannel = await guild.channels.create({
                                    name: channel.name,
                                    type: channel.type,
                                    parent: channel.parent,
                                    reason: 'Recreating channel.'
                                });

                                button.setDisabled(true);
                                await msg.edit({ components: [row] });
                                await i.followUp({ content: `Channel ${newChannel} was created successfully.`, ephemeral: true });
                            });
                        }
                        break;
                    }

                    case AuditLogEvent.RoleDelete: {
                        const executor = await this.client.users.fetch(executorId!).catch(() => null);

                        if (executor) {
                            const roleName = changes.find((change) => change.key === 'name')?.old!;
                            const rolePermissions = changes.find((change) => change.key === 'permissions')?.old!;
                            const roleHoisted = changes.find((change) => change.key === 'hoist')?.old!;
                            const roleColor = changes.find((change) => change.key === 'color')?.old!;
                            const roleMentionable = changes.find((change) => change.key === 'mentionable')?.old!;

                            const embed = new ClientEmbed(this.client)
                                .setColor(parseInt(roleColor.toString(16), 16))
                                .setTitle('Role Deleted')
                                .setDescription(`Role ${roleName} was deleted by ${executor} (${executor.id}) on ${guild.name}.`)
                                .setFields([
                                    { name: 'Name:', value: roleName, inline: true },
                                    { name: 'Permissions:', value: rolePermissions.toString(), inline: true },
                                    { name: 'Hoisted:', value: roleHoisted ? 'Yes' : 'No', inline: true },
                                    { name: 'Color:', value: '#' + roleColor.toString(16), inline: true },
                                    { name: 'Mentionable:', value: roleMentionable ? 'Yes' : 'No', inline: true }
                                ]);

                            const button = new ButtonBuilder()
                                .setStyle(ButtonStyle.Secondary)
                                .setLabel('Recreate Role')
                                .setCustomId('recreate-role')
                                .setEmoji('🔁');

                            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                            
                            const msg = await logChannel.send({ embeds: [embed], components: [row] });
                            const filter = (i: MessageComponentInteraction) => (i.user.id === '1110284870875361350' && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                            const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 3 });

                            collector.on('end', async () => {
                                button.setDisabled(true);
                                return void await msg.edit({ embeds: [embed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })], components: [row] });
                            });

                            collector.on('collect', async (i: ButtonInteraction) => {
                                const newRole = await guild.roles.create({
                                    name: roleName,
                                    permissions: BigInt(rolePermissions),
                                    hoist: roleHoisted,
                                    color: roleColor,
                                    mentionable: roleMentionable
                                });

                                button.setDisabled(true);
                                await msg.edit({ components: [row] });
                                await i.followUp({ content: `Role ${newRole} was created successfully.`, ephemeral: true });
                            });
                        }
                        break;
                    }

                    case AuditLogEvent.MemberBanAdd: {
                        const executor = await this.client.users.fetch(executorId!).catch(() => null);
                        const bannedUser = await this.client.users.fetch(targetId!).catch(() => null);

                        if (executor && bannedUser) {
                            await logChannel.send(`${bannedUser.tag} was banned by ${executor.tag} on ${guild.name}.`);
                        }
                        break;
                    }

                    case AuditLogEvent.MemberKick: {
                        const executor = await this.client.users.fetch(executorId!).catch(() => null);
                        const kickedUser = await this.client.users.fetch(targetId!).catch(() => null);

                        if (executor && kickedUser) {
                            await logChannel.send(`${kickedUser.tag} was kicked by ${executor.tag} on ${guild.name}.`);
                        }
                        break;
                    }
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, GuildAuditLogEntryCreateListener.name);
            Logger.warn((err as Error).stack, GuildAuditLogEntryCreateListener.name);
        }
    }
}