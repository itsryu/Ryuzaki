import { Ryuzaki } from '../RyuzakiClient';
import { ClientEvents, Awaitable } from 'discord.js';

interface EventOptions {
    name: keyof ClientEvents;
    once?: boolean;
}

export abstract class ListenerStructure {
    readonly client: Ryuzaki;
    readonly options: EventOptions;

    constructor(client: Ryuzaki, options: EventOptions) {
        this.client = client;
        this.options = options;
    }

    abstract eventExecute(...args: ClientEvents[keyof ClientEvents]): Awaitable<void> | void;
}