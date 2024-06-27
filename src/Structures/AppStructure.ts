import { Shard } from 'discord.js';

export abstract class AppStructure {
    public readonly shard: Shard;

    public constructor(shard: Shard) {
        this.shard = shard;
    }

    public abstract serverExecute(...args: any[]): Promise<void> | void;
}