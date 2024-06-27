import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure, ServiceStructure } from '../Structures/';
import { readdirSync } from 'fs';
import { join } from 'path';

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
                    this.client.logger.error((serviceError as Error).message, `Service: ${file}`);
                    this.client.logger.warn((serviceError as Error).stack, `Service: ${file}`);
                }
            });

            await Promise.all(service);
        } catch (err) {
            this.client.logger.error((err as Error).message, Services.name);
            this.client.logger.warn((err as Error).stack, Services.name);
        }
    }
}