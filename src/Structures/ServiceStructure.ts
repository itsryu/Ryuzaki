import { Ryuzaki } from '../RyuzakiClient';

type ServiceName = 'CheckPermissions' | 'DatabaseConnection' | 'LoadModules' | 'SetActivity';

interface RawServiceData {
    name: ServiceName;
    initialize: boolean;
}

export abstract class ServiceStructure<T = void> {
    public readonly client: Ryuzaki;
    public readonly data: RawServiceData;

    public constructor(client: Ryuzaki, data: RawServiceData) {
        this.client = client;
        this.data = data;
    }

    public abstract serviceExecute(...args: any[]): Promise<T> | T;
}