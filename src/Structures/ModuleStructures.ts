import { Ryuzaki } from '../RyuzakiClient';

export abstract class ModuleStructure<T = void> {
    public constructor(public readonly client: Ryuzaki) {
        this.client = client;
    }

    public abstract moduleExecute(...args: any[]): Promise<T> | T;
}