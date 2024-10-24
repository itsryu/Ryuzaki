import { cpuUsage, memoryUsage } from 'node:process';
import { client } from './client';
import { ShardMemory, Stats } from '../types/clientTypes';
import { Client, Collection } from 'discord.js';

export class ClientStats {
    private static botMessages = 0;
    private static interactions = 0;
    private static isLastShard = false;
    private static totalChannels = 0;
    private static totalEmojis = 0;
    private static totalGuilds = 0;
    private static totalInteractions = 0;
    private static totalMemoryUsage = 0;
    private static totalMessages = 0;
    private static totalUsers = 0;
    private static totalVoiceAdapters = 0;
    private static userMessages = 0;
    private static readonly usedCommands: Record<string, number> = {};

    public static get totalShards(): number {
        return client.shard?.count ?? 0;
    }

    public static get channels() {
        return client.channels.cache.size;
    }

    public static get cpuUsage() {
        return cpuUsage();
    }

    public static get emojis() {
        return client.emojis.cache.size;
    }

    public static get guilds() {
        return client.guilds.cache.size;
    }

    public static get memoryUsage() {
        return memoryUsage();
    }

    public static get messages() {
        return ClientStats.botMessages + ClientStats.userMessages;
    }

    public static get readyAt() {
        return client.readyAt;
    }

    public static get readyTimestamp() {
        return client.readyTimestamp;
    }

    public static get shards() {
        return client.shard?.count ?? 0;
    }

    public static get shardId() {
        return client.shard?.ids[0] ?? 0;
    }

    public static get shardIds() {
        return client.shard?.ids ?? [];
    }

    public static get uptime() {
        return client.uptime;
    }

    public static get users() {
        return client.users.cache.size;
    }

    public static get voiceAdapters() {
        return client.voice.adapters.size;
    }

    public static get wsPing() {
        return client.ws.ping;
    }

    public static get wsStatus() {
        return client.ws.status;
    }

    public static async fetch() {
        return client.shard?.broadcastEval(client => ({
            Channels: client.channels.cache.size,
            Emojis: client.emojis.cache.size,
            Guilds: client.guilds.cache.size,
            Users: client.users.cache.size,
            VoiceAdapters: client.voice.adapters.size
        }))
            .then(result => {
                const keys = Object.keys(result[0]) as (keyof typeof result[number])[];

                const values = keys.reduce<Record<typeof keys[number], number>>((acc, val) => {
                    acc[val] = 0;
                    return acc;
                }, {} as Record<typeof keys[number], number>);

                result.reduce((acc, val) => {
                    for (const key of keys) {
                        acc[key] += val[key];
                    }
                    return acc;
                }, values);

                for (const key of keys) {
                    this[`total${key}`] = values[key];
                }

                return this;
            })
            .catch(() => this) ?? this;
    }

    public static async getMemoryUsage() {
        const shardsCount = ClientStats.shards;
        const shardMemoryPromises = client.shard?.broadcastEval(() => process.memoryUsage().heapUsed) ?? [];
        const shardGuildsPromises = client.shard?.broadcastEval((client: Client) => client.guilds.cache.map(guild => guild.id)) ?? [];
        const [shardMemoryValues, shardGuildsValues] = await Promise.all([shardMemoryPromises, shardGuildsPromises]);

        const memoryUsage: ShardMemory = {
            totalMemory: shardMemoryValues.reduce((total, shardMemory) => total + shardMemory, 0) / 1024 / 1024,
            shards: {}
        };

        for (let shardId = 0; shardId < shardsCount; shardId++) {
            const shardMemory = shardMemoryValues[shardId] / 1024 / 1024;
            const shardGuilds = shardGuildsValues[shardId];

            memoryUsage.shards[shardId] = {
                shardMemory,
                servers: new Collection<string, { memory: number }>()
            };

            const avgMemoryPerGuild = shardMemory / shardGuilds.length;

            for (const guildId of shardGuilds) {
                memoryUsage.shards[shardId].servers.set(guildId, { memory: avgMemoryPerGuild });
            }
        }

        return memoryUsage;
    }

    public static toJSON(): Stats {
        return {
            botMessages: ClientStats.botMessages,
            channels: ClientStats.channels,
            cpuUsage: ClientStats.cpuUsage,
            emojis: ClientStats.emojis,
            guilds: ClientStats.guilds,
            interactions: ClientStats.interactions,
            isLastShard: ClientStats.isLastShard,
            memoryUsage: ClientStats.memoryUsage,
            messages: ClientStats.messages,
            readyAt: ClientStats.readyAt,
            readyTimestamp: ClientStats.readyTimestamp,
            shards: ClientStats.shards,
            shardId: ClientStats.shardId,
            shardIds: ClientStats.shardIds,
            totalChannels: ClientStats.totalChannels,
            totalEmojis: ClientStats.totalEmojis,
            totalGuilds: ClientStats.totalGuilds,
            totalInteractions: ClientStats.totalInteractions,
            totalMemoryUsage: ClientStats.totalMemoryUsage,
            totalMessages: ClientStats.totalMessages,
            totalShards: ClientStats.totalShards,
            totalUsers: ClientStats.totalUsers,
            totalVoiceAdapters: ClientStats.totalVoiceAdapters,
            uptime: ClientStats.uptime,
            usedCommands: ClientStats.usedCommands,
            userMessages: ClientStats.userMessages,
            users: ClientStats.users,
            voiceAdapters: ClientStats.voiceAdapters,
            wsPing: ClientStats.wsPing,
            wsStatus: ClientStats.wsStatus
        };
    }
}