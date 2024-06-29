import { Shard } from 'discord.js';

export abstract class AppStructure {
    public constructor(public readonly shard: Shard) {
        this.shard = shard;
    }

    public abstract serverExecute(...args: any[]): Promise<void> | void;
}