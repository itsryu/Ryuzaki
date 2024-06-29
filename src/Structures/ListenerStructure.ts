import { Ryuzaki } from '../RyuzakiClient';
import { ClientEvents } from 'discord.js';

interface EventOptions {
    name: keyof ClientEvents;
    once?: boolean;
}

export abstract class ListenerStructure {
    public constructor(public readonly client: Ryuzaki, public readonly options: EventOptions) {
        this.client = client;
        this.options = options;
    }

    public abstract eventExecute(...args: ClientEvents[keyof ClientEvents]): Promise<void> | void;
}