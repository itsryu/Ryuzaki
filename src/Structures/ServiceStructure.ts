import { Ryuzaki } from '../RyuzakiClient';

interface RawServiceData {
    name: string;
    initialize: boolean;
    amount?: number;
    interval?: number;
    wait?: number;
}

export abstract class ServiceStructure {
    client: Ryuzaki;
    data: RawServiceData;

    constructor(client: Ryuzaki, data: RawServiceData) {
        this.client = client;
        this.data = data;
    }

    abstract serviceExecute(...args: any[]): Promise<any> | any;
}