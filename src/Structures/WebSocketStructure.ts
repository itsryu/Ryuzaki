import { Ryuzaki } from '../RyuzakiClient';
import { Awaitable } from 'discord.js';


export abstract class WebSocketStructure {
    readonly client: Ryuzaki;

    constructor(client: Ryuzaki) {
        this.client = client;
    }

    abstract socketExecute(...args: any[]): Awaitable<void> | void;
}