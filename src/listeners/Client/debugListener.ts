import { Ryuzaki } from '../../ryuzakiClient';
import { ListenerStructure } from '../../structures';
import { Events} from 'discord.js';
import { Logger } from '../../utils';

export default class DebugListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.Debug
        });
    }

    eventExecute(message: string) {
        try {
            Logger.warn(message, DebugListener.name);
        } catch (err) {
            Logger.error((err as Error).message, DebugListener.name);
            Logger.warn((err as Error).stack, DebugListener.name);
        }
    }
}