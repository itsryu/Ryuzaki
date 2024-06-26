import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure, ServiceStructure } from '../Structures/';
import { readdirSync } from 'fs';
import { join } from 'path';

export default class Services extends ModuleStructure {
    async moduleExecute() {
        try {
            const serviceFolder = readdirSync(join(__dirname, 'Modules'), { withFileTypes: true }).filter((dirent) => dirent.isFile() && dirent.name.endsWith('.js')).map((dirent) => dirent.name);

            for (const file of serviceFolder) {
                const { default: ServiceClass }: { default: new (client: Ryuzaki) => ServiceStructure } = await import(`../Services/Modules/${file}`);
                const service = new ServiceClass(this.client);

                this.client.services.set(service.data.name, service);

                if (service.data.initialize) {
                    await service.serviceExecute();
                }
            }
            
        } catch (err) {
            this.client.logger.error((err as Error).message, Services.name);
            this.client.logger.warn((err as Error).stack, Services.name);
        }
    }
}