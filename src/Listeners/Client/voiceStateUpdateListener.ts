import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, ListenerStructure } from '../../Structures';
import { TextChannel, VoiceState } from 'discord.js';

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
                const user = await this.client.getData(newState.member.user.id, 'user');
                const guild = await this.client.getData(newState.guild.id, 'guild');
                const call = user.call;

                // usuário entrou na chamada:
                if (!oldState.channel && newState.channel) {
                    call.lastRegister = Date.now();
                    call.lastCall += call.lastRegister - call.totalCall;

                    await user.save();

                    if (guild.logs.status && guild.logs.calls) {
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
                                    value: `\`${newState.channel.name}\` \`(${newState.channelId})\``,
                                    inline: true
                                },
                                {
                                    name: 'Tempo total em ligações:',
                                    value: `\`${this.client.utils.formatDuration(call.totalCall)}\``,
                                    inline: false
                                });

                        const channel = newState.guild.channels.cache.get(guild.logs.channel) as TextChannel;
                        channel.send({ embeds: [embed] });
                    }
                }

                // usuário saiu da chamada:
                if (oldState.channel && !newState.channel) {
                    call.totalCall += (Date.now() - call.lastRegister);

                    await user.save();

                    if (guild.logs.status && guild.logs.calls) {
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
                                    value: `\`${oldState.channel.name}\` \`(${oldState.channelId})\``,
                                    inline: true
                                },
                                {
                                    name: 'Tempo na ligação:',
                                    value: `\`${this.client.utils.formatDuration(Date.now() - call.lastRegister)}\``,
                                    inline: false
                                },
                                {
                                    name: 'Tempo total em ligações:',
                                    value: `\`${this.client.utils.formatDuration(call.totalCall)}\``,
                                    inline: true
                                });

                        const channel = newState.guild.channels.cache.get(guild.logs.channel) as TextChannel;
                        channel.send({ embeds: [embed] });
                    }
                }

                // usuário mudou de canal:
                if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                    call.totalCall += (Date.now() - call.lastRegister);

                    await user.save();

                    if (guild.logs.status && guild.logs.calls) {
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
                                    value: `\`${oldState.channel?.name}\` \`(${oldState.channelId})\``,
                                    inline: true
                                },
                                {
                                    name: 'Canal atual:',
                                    value: `\`${newState.channel?.name}\` \`(${newState.channelId})\``,
                                    inline: true
                                },
                                {
                                    name: 'Tempo na ligação:',
                                    value: `\`${this.client.utils.formatDuration(Date.now() - call.lastRegister)}\``,
                                    inline: false
                                },
                                {
                                    name: 'Tempo total em ligações:',
                                    value: `\`${this.client.utils.formatDuration(call.totalCall)}\``,
                                    inline: true
                                });

                        const channel = newState.guild.channels.cache.get(guild.logs.channel) as TextChannel;
                        channel.send({ embeds: [embed] });
                    }
                }

                // usuário mutou/desmutou o microfone:
                if (newState.selfMute && !oldState.selfMute) {
                    call.totalCall += (Date.now() - call.lastRegister);

                    await user.save();
                }

                // usuário desmutou o microfone:
                if (!newState.selfMute && oldState.selfMute) {
                    call.lastRegister = Date.now();
                    call.lastCall += call.lastRegister - call.totalCall;

                    await user.save();
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, VoiceStateUpdateListener.name);
            this.client.logger.warn((err as Error).stack!, VoiceStateUpdateListener.name);
        }
    }
}