import { Ryuzaki } from '../../ryuzakiClient';
import { ServiceStructure } from '../../structures';
import { connect, connection } from 'mongoose';
import { Logger, Util } from '../../utils';

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
            const ping = await Util.databasePing(connection);
            Logger.info(`Pinged your deployment. You successfully connected to MongoDB with ${ping}ms!`, 'Database');
        } catch (err) {
            Logger.error((err as Error).message, DatabaseConnectionService.name);
            Logger.warn((err as Error).stack, DatabaseConnectionService.name);
        }
    }
}