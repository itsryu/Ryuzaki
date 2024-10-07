import { extend } from 'dayjs';
import 'dayjs/locale/pt';
import 'dayjs/locale/en';
import { client } from './Client/Client';
import App from './Web/backend/server';
import { Logger } from './Utils/logger';


(async () => {
    await client.login(process.env.CLIENT_TOKEN);
    await client.initialize();

    if (client.shard && (client.shard.ids[0] === (client.shard.count - 1))) {
        Logger.info('All shards are ready! Starting WEB server...', 'Initialization');
        const server = new App(client);
        server.serverExecute();
    }

    extend((await import('dayjs/plugin/localizedFormat')).default);
    extend((await import('dayjs/plugin/duration')).default);
    extend((await import('dayjs/plugin/utc')).default);
    extend((await import('dayjs/plugin/relativeTime')).default);
})()
    .catch((err: unknown) => {
        Logger.error((err as Error).message, 'RyuzakiLauncher');
        Logger.warn((err as Error).stack, 'RyuzakiLauncher');
    });
