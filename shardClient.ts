import { ShardingManager } from 'discord.js';
import { Logger } from './src/Utils/util';
import { config } from 'dotenv';
import { join } from 'path';
config();

class Shard extends ShardingManager {
    logger: Logger;

    constructor() {
        super(join(__dirname, './src/RyuzakiLauncher.js'), {
            mode: 'process',
            totalShards: 0,
            respawn: true,
            execArgv: ['--trace-warnings'],
            shardArgs: ['--ansi', '--color'],
            token: process.env.CLIENT_TOKEN
        });

        this.logger = new Logger();
    }

    initialize(): void {
        this.shardEvents();
    }

    shardEvents(): void {
        this.on('shardCreate', (shard) => {
            shard.on('spawn', () => {
                this.logger.info(`Starting Shard: [${shard.id}]`, 'Shard');
            });
            shard.on('ready', () => {
                this.logger.info(`Shard [${shard.id}] started!`, 'Shard');
            });
            shard.on('disconnect', () => {
                this.logger.error(`Shard [${shard.id}] disconnected.`, 'Shard');
            });
            shard.on('reconnecting', () => {
                this.logger.warn(`Reconnecting Shard: [${shard.id}]`, 'Shard');
            });
            shard.on('death', () => {
                this.logger.error(`Shard [${shard.id}] died!`, 'Shard');
            });
            shard.on('error', (err: Error) => {
                this.logger.error(`Shard [${shard.id}] threw an error: ${err.stack}`, 'Shard');
            });
        });

        this.spawn({ timeout: 1000 * 60 * 2, amount: this.totalShards });
    }
}

new Shard().initialize();
