import { Ryuzaki } from '../RyuzakiClient';
import { Awaitable, GatewayDispatchEvents } from 'discord.js';

interface RawEventOptions {
    name: GatewayDispatchEvents;
    once?: boolean;
}

export abstract class RawListenerStructure {
    readonly client: Ryuzaki;
    readonly options: RawEventOptions;

    constructor(client: Ryuzaki, options: RawEventOptions) {
        this.client = client;
        this.options = options;
    }

    abstract eventExecute(...args: unknown[]): Awaitable<void> | void;
}