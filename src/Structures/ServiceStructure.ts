import { Ryuzaki } from '../RyuzakiClient';


type ServiceName = 'CheckPermissions' | 'DatabaseConnection' | 'LoadModules' | 'SetActivity';

interface RawServiceData {
    name: ServiceName;
    initialize: boolean;
    amount?: number;
    interval?: number;
    wait?: number;
}

export abstract class ServiceStructure<T = void> {
    client: Ryuzaki;
    data: RawServiceData;

    constructor(client: Ryuzaki, data: RawServiceData) {
        this.client = client;
        this.data = data;
    }

    abstract serviceExecute(...args: any[]): Promise<T> | T;
}