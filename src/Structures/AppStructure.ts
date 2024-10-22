import { Ryuzaki } from '../ryuzakiClient';

export abstract class AppStructure {
    public constructor(public readonly client: Ryuzaki) {
        this.client = client;
    }

    public abstract serverExecute(...args: any[]): Promise<void> | void;
}