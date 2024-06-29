import { Ryuzaki } from '../RyuzakiClient';
import { GatewayDispatchEvents } from 'discord.js';

interface RawEventOptions {
    name: GatewayDispatchEvents;
    once?: boolean;
}

export abstract class RawListenerStructure {
    constructor(public readonly client: Ryuzaki, public readonly options: RawEventOptions) {
        this.client = client;
        this.options = options;
    }

    abstract eventExecute(...args: unknown[]): Promise<void> | void;
}