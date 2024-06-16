import { Ryuzaki } from '../RyuzakiClient';

export abstract class AppStructure {
    readonly client: Ryuzaki;

    constructor(client: Ryuzaki) {
        this.client = client;
    }

    abstract serverExecute(...args: any[]): Promise<void> | void;
}