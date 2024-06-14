import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure } from '../../Structures';
import { VoiceState } from 'discord.js'; 
import Day from 'dayjs';

export default class voiceStateUpdateListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: 'voiceStateUpdate'
        });
    }

    /**
     * @param {VoiceState} oldState - Represents the voice state for a Guild Member.
     * @param {VoiceState} newState - Represents the voice state for a Guild Member.
     */
    async eventExecute(oldState: VoiceState, newState: VoiceState) {
        try {
            const user = await this.client.getData(newState.member?.user.id, 'user');
            const call = user.call;

            // verifica se o usuário entrou em uma nova chamada
            if (!oldState.channel && newState.channel) {

                // atualiza o valor de lastRegister
                call.lastRegister = Date.now();

                // atualiza o valor de lastCall se o usuário estava anteriormente em uma chamada
                if (call.status) {
                    call.lastCall = call.lastCall + (call.lastRegister - call.totalCall);
                }

                // atualiza o valor de status para indicar que o usuário está em uma chamada
                call.status = true;

                // salva as alterações no banco de dados
                await user.save();

                console.log('Entrou:', Day.duration(Date.now() - call.totalCall).format('D [dias] H [horas] m [minutos] e s [segundos]'));
            }

            // verifica se o usuário saiu da chamada
            if (oldState.channel && !newState.channel) {
                // atualiza o valor de totalCall e status
                call.totalCall = call.totalCall + (Date.now() - call.lastRegister);
                call.status = false;

                // salva as alterações no banco de dados
                await user.save();

                console.log('Saiu:', Day.duration(Date.now() - call.totalCall).format('D [dias] H [horas] m [minutos] e s [segundos]'));
            }

            // verifica se o usuário mudou o status de mudo ou surdo
            if (oldState.serverMute !== newState.serverMute || oldState.serverDeaf !== newState.serverDeaf) {

                // atualiza o valor de lastCall e status
                const now = Date.now();
                if (call.status) {
                    call.lastCall = call.lastCall + (now - call.lastRegister);
                }
                call.status = !(newState.serverMute || newState.serverDeaf);
                call.lastRegister = now;

                // salva as alterações no banco de dados
                await user.save();

                console.log('Mutou:', Day.duration(Date.now() - call.totalCall).format('D [dias] H [horas] m [minutos] e s [segundos]'));
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, voiceStateUpdateListener.name);
            this.client.logger.warn((err as Error).stack!, voiceStateUpdateListener.name);
        }
    }
}