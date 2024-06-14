import { Ryuzaki } from '../../RyuzakiClient';
import { ServiceStructure } from '../../Structures/';
import { connect, connection } from 'mongoose';

export default class DatabaseConnectionService extends ServiceStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: 'dbConnection',
            initialize: true
        });
    }

    async serviceExecute() {
        try {
            await connect(process.env.MONGO_CONNECTION_URI, { autoIndex: false });

            connection.on('error', (err) => {
                this.client.logger.error(err.stack, 'Database');
            });

            connection.once('open', () => {
                this.client.logger.info('Database loaded successfully.', 'Database');
            });
        } catch (err) {
            this.client.logger.error((err as Error).message, DatabaseConnectionService.name);
            this.client.logger.warn((err as Error).stack!, DatabaseConnectionService.name);
        }
    }
}