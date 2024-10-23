import { Ryuzaki } from '../ryuzakiClient';
import { ModuleStructure, ServiceStructure } from '../structures';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Logger } from '../utils';

export default class Services extends ModuleStructure {
    async moduleExecute() {
        try {
            const serviceFiles = readdirSync(join(__dirname, 'Modules'))
                .filter(file => file.endsWith('.js'));

            const service = serviceFiles.map(async (file) => {
                try {
                    const { default: ServiceClass }: { default: new (client: Ryuzaki) => ServiceStructure } = await import(`../Services/Modules/${file}`);
                    const service = new ServiceClass(this.client);

                    this.client.services.set(service.data.name, service);

                    if (service.data.initialize) {
                        await service.serviceExecute();
                    }
                } catch (serviceError) {
                    Logger.error((serviceError as Error).message, `Service: ${file}`);
                    Logger.warn((serviceError as Error).stack, `Service: ${file}`);
                }
            });

            await Promise.all(service);
        } catch (err) {
            Logger.error((err as Error).message, Services.name);
            Logger.warn((err as Error).stack, Services.name);
        }
    }
}