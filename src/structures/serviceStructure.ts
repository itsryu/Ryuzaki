import { Ryuzaki } from '../ryuzakiClient';

type ServiceName = 'CheckPermissions' | 'DatabaseConnection' | 'LoadModules' | 'SetActivity';

interface RawServiceData {
    name: ServiceName;
    initialize: boolean;
}

export abstract class ServiceStructure<T = void> {
    public constructor(public readonly client: Ryuzaki, public readonly data: RawServiceData) {
        this.client = client;
        this.data = data;
    }

    public abstract serviceExecute(...args: any[]): Promise<T> | T;
}