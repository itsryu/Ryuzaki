import { Ryuzaki } from '../../RyuzakiClient';
import { ServiceStructure } from '../../Structures';
import { connect, connection } from 'mongoose';
import { Logger } from '../../Utils/logger';

export default class DatabaseConnectionService extends ServiceStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: 'DatabaseConnection',
            initialize: true
        });
    }

    async serviceExecute() {
        try {
            await connect(process.env.MONGO_CONNECTION_URI, { autoIndex: false, serverApi: { version: '1', strict: true, deprecationErrors: true } });
            await connection.db.admin().command({ ping: 1 });
            Logger.info('Pinged your deployment. You successfully connected to MongoDB!', 'Database');
        } catch (err) {
            Logger.error((err as Error).message, DatabaseConnectionService.name);
            Logger.warn((err as Error).stack, DatabaseConnectionService.name);
        }
    }
}