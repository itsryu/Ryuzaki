import { ShardingManager } from 'discord.js';
import { config } from 'dotenv';
import { join } from 'path';
import { Logger } from './src/Utils/logger';
config();

export class ShardManager extends ShardingManager {
    public readonly logger: Logger = new Logger();
    public shardsReady = 0;

    async initialize(): Promise<void> {
        try {
            this.on('shardCreate', (shard) => {
                shard.on('spawn', () => {
                    this.logger.info(`Starting Shard: [${shard.id.toString()}]`, ShardManager.name);
                });
                shard.on('ready', () => {
                    this.shardsReady++;
                    this.logger.info(`Shard [${shard.id.toString()}] is ready! (${this.shardsReady}/${this.totalShards})`, ShardManager.name);
                });
                shard.on('disconnect', () => {
                    this.logger.error(`Shard [${shard.id.toString()}] disconnected.`, ShardManager.name);
                });
                shard.on('reconnecting', () => {
                    this.logger.warn(`Reconnecting Shard: [${shard.id.toString()}]`, ShardManager.name);
                });
                shard.on('resume', () => {
                    this.logger.info(`Shard [${shard.id.toString()}] resumed!`, ShardManager.name);
                });
                shard.on('death', () => {
                    this.logger.error(`Shard [${shard.id.toString()}] died!`, ShardManager.name);
                });
                shard.on('error', (err) => {
                    this.logger.error(`Shard [${shard.id.toString()}] threw an error: ${err.stack ?? err.message}`, ShardManager.name);
                });
            });

            await this.spawn({ timeout: 1000 * 60 * 2, amount: this.totalShards, delay: 1000 * 5 })
                .catch((err: unknown) => {
                    this.logger.error((err as Error).message, ShardManager.name);
                    this.logger.warn((err as Error).stack, ShardManager.name);
                });
        } catch (err) {
            this.logger.error((err as Error).message, ShardManager.name);
            this.logger.warn((err as Error).stack, ShardManager.name);
        }
    }

    public get isReady(): boolean {
        return this.shardsReady === this.totalShards;
    }

    public get shardCount(): number {
        return this.shardList.length;
    }
}

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
        console.error((err as Error).message);
        console.log((err as Error).stack);
    });

