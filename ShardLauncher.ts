import { ShardManager } from './ShardManager';
import { join } from 'path';
import { Logger } from './src/Utils/logger';

const shard = new ShardManager(join(__dirname, './src/RyuzakiLauncher.js'), {
    mode: 'process',
    totalShards: 'auto',
    respawn: true,
    execArgv: ['--trace-warnings'],
    shardArgs: ['--ansi', '--color'],
    token: process.env.CLIENT_TOKEN,
    shardList: 'auto',
    silent: false
});

(async () => {
    await shard.initialize();
})()
    .catch((err: unknown) => {
        Logger.error((err as Error).message, 'ShardLauncher');
        Logger.warn((err as Error).stack, 'ShardLauncher');
    });