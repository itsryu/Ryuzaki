import { Ryuzaki } from '../RyuzakiClient';

export abstract class ModuleStructure {
    readonly client: Ryuzaki;

    constructor(client: Ryuzaki) {
        this.client = client;
    }

    abstract moduleExecute(...args: any[]): Promise<any> | any;
}