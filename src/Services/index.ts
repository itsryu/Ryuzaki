import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure, ServiceStructure } from '../Structures/';
import { Status } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

export default class Services extends ModuleStructure {
    async moduleExecute() {
        try {
            const serviceFolder = readdirSync(join(__dirname, 'Modules'), { withFileTypes: true }).filter((dirent) => dirent.isFile() && dirent.name.endsWith('.js')).map((dirent) => dirent.name);
            const initializeServices: ServiceStructure[] = [];

            for (const file of serviceFolder) {
                const { default: ServiceClass }: { default: new (client: Ryuzaki) => ServiceStructure } = await import(`../Services/Modules/${file}`);
                const service = new ServiceClass(this.client);

                if (service.data) {
                    this.client.services.set(service.data.name, service);

                    if (service.data.initialize) {
                        initializeServices.push(service);
                    }
                }
            }

            const shardInterval = setInterval(async () => {
                const readyShards = this.client.ws.shards.filter((shard) => shard.status === Status.Ready);

                if (readyShards.size === (this.client.options.shards as number[]).length) {
                    clearInterval(shardInterval);
                    this.client.logger.info('All shards are ready, starting services.', 'Services');

                    for (const service of initializeServices) {
                        await this.client.utils.executeService(service);
                    }

                    this.client.logger.info('Services loaded successfully.', 'Services');
                } else {
                    this.client.logger.info(`Waiting for ${(this.client.options.shards as number[]).length - readyShards.size} shards to be ready...`, 'Services');
                }
            }, 1000);
        } catch (err) {
            this.client.logger.error((err as Error).message, Services.name);
            this.client.logger.warn((err as Error).stack, Services.name);
        }
    }
}