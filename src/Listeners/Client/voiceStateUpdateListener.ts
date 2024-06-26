import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, ListenerStructure } from '../../Structures';
import { TextChannel, VoiceState } from 'discord.js';
import { Util } from '../../Utils/util';
import { Languages } from '../../Types/ClientTypes';

export default class VoiceStateUpdateListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: 'voiceStateUpdate'
        });
    }

    async eventExecute(oldState: VoiceState, newState: VoiceState) {
        if (newState.member?.user.bot) return;

        try {
            if (newState.member) {
                const userData = await this.client.getData(newState.member.user.id, 'user');
                const guildData = await this.client.getData(newState.guild.id, 'guild');

                if (userData && guildData) {
                    const call = userData.call;
                    const language = guildData.lang as Languages;

                    if (!oldState.channel && newState.channel) {
                        call.lastRegister = Date.now();
                        call.lastCall += call.lastRegister - call.totalCall;

                        await userData.save();

                        if (guildData.logs.status && guildData.logs.calls) {
                            const embed = new ClientEmbed(this.client)
                                .setThumbnail(newState.member.displayAvatarURL({ extension: 'png', size: 4096 }))
                                .setAuthor({ name: 'Usuário entrou em canal de voz', iconURL: newState.guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                                .addFields(
                                    {
                                        name: 'Usuário:',
                                        value: `\`${newState.member.user.tag}\` \`(${newState.member.id})\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Canal:',
                                        value: `${newState.channel} \`(${newState.channelId})\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Tempo total em ligações:',
                                        value: Util.formatDuration(call.totalCall, language) != '' ? `\`${Util.formatDuration(call.totalCall, language)}\`` : '`0 segundos`',
                                        inline: false
                                    });

                            const channel = newState.guild.channels.cache.get(guildData.logs.channel) as TextChannel;
                            await channel.send({ embeds: [embed] });
                        }
                    }

                    if (oldState.channel && !newState.channel) {
                        call.totalCall += (Date.now() - call.lastRegister);

                        await userData.save();

                        if (guildData.logs.status && guildData.logs.calls) {
                            const embed = new ClientEmbed(this.client)
                                .setThumbnail(newState.member.displayAvatarURL({ extension: 'png', size: 4096 }))
                                .setAuthor({ name: 'Usuário saiu de canal de voz', iconURL: newState.guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                                .addFields(
                                    {
                                        name: 'Usuário:',
                                        value: `\`${newState.member.user.tag}\` \`(${newState.member.id})\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Canal:',
                                        value: `${oldState.channel} \`(${oldState.channelId})\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Tempo na ligação:',
                                        value: `\`${Util.formatDuration(Date.now() - call.lastRegister, language)}\``,
                                        inline: false
                                    },
                                    {
                                        name: 'Tempo total em ligações:',
                                        value: Util.formatDuration(call.totalCall, language) != '' ? `\`${Util.formatDuration(call.totalCall, language)}\`` : '`0 segundos`',
                                        inline: true
                                    });

                            const channel = newState.guild.channels.cache.get(guildData.logs.channel) as TextChannel;
                            await channel.send({ embeds: [embed] });
                        }
                    }

                    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                        call.totalCall += (Date.now() - call.lastRegister);

                        await userData.save();

                        if (guildData.logs.status && guildData.logs.calls) {
                            const embed = new ClientEmbed(this.client)
                                .setThumbnail(newState.member.displayAvatarURL({ extension: 'png', size: 4096 }))
                                .setAuthor({ name: 'Usuário mudou de canal de voz', iconURL: newState.guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                                .addFields(
                                    {
                                        name: 'Usuário:',
                                        value: `\`${newState.member.user.tag}\` \`(${newState.member.id})\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Canal anterior:',
                                        value: `${oldState.channel} \`(${oldState.channelId})\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Canal atual:',
                                        value: `${newState.channel} \`(${newState.channelId})\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Tempo na ligação:',
                                        value: `\`${Util.formatDuration(Date.now() - call.lastRegister, language)}\``,
                                        inline: false
                                    },
                                    {
                                        name: 'Tempo total em ligações:',
                                        value: call.totalCall > 0 ? `\`${Util.formatDuration(call.totalCall, language)}\`` : '`0 segundos`',
                                        inline: true
                                    });

                            const channel = newState.guild.channels.cache.get(guildData.logs.channel) as TextChannel;
                            await channel.send({ embeds: [embed] });
                        }
                    }

                    if (newState.selfMute && !oldState.selfMute) {
                        call.totalCall += (Date.now() - call.lastRegister);

                        await userData.save();
                    }

                    if (!newState.selfMute && oldState.selfMute) {
                        call.lastRegister = Date.now();
                        call.lastCall += call.lastRegister - call.totalCall;

                        await userData.save();
                    }
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, VoiceStateUpdateListener.name);
            this.client.logger.warn((err as Error).stack, VoiceStateUpdateListener.name);
        }
    }
}