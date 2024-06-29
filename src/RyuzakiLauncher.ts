import { extend } from 'dayjs';
import 'dayjs/locale/pt';
import 'dayjs/locale/en';
import client from './Client';

(async () => {
    await client.initialize();
    await client.login(process.env.CLIENT_TOKEN);
    extend((await import('dayjs/plugin/localizedFormat')).default);
    extend((await import('dayjs/plugin/duration')).default);
    extend((await import('dayjs/plugin/utc')).default);
    extend((await import('dayjs/plugin/relativeTime')).default);
})()
    .catch((err: unknown) => {
        console.error((err as Error).message);
        console.log((err as Error).stack);
    });
