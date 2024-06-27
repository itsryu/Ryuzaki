import { Ryuzaki } from '../RyuzakiClient';

export abstract class ModuleStructure<T = void> {
    public readonly client: Ryuzaki;

    public constructor(client: Ryuzaki) {
        this.client = client;
    }

    public abstract moduleExecute(...args: any[]): Promise<T> | T;
}