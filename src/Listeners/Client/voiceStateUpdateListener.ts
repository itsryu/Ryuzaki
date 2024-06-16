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
                            .setAuthor({ name: newState.guild.name, iconURL: newState.guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                            .setTitle('Mensagem deletada');

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
                            .setAuthor({ name: newState.guild.name, iconURL: newState.guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                            .setTitle('Mensagem deletada');
                            
                        const channel = newState.guild.channels.cache.get(guild.logs.channel) as TextChannel;
                        channel.send({ embeds: [embed] });
                    }
                }

                // usuário mudou de canal:
                if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                    call.totalCall += (Date.now() - call.lastRegister);

                    await user.save();
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