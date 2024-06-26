import { cpuUsage, memoryUsage } from 'node:process';
import { client } from './Client';
import { Stats } from '../Types/ClientTypes';

export default class ClientStats {
    botMessages = 0;
    interactions = 0;
    isLastShard = false;
    totalChannels = 0;
    totalEmojis = 0;
    totalGuilds = 0;
    totalInteractions = 0;
    totalMemoryUsage = 0;
    totalMessages = 0;
    totalShards = client.shard?.count ?? 0;
    totalUsers = 0;
    totalVoiceAdapters = 0;
    userMessages = 0;
    readonly usedCommands: Record<string, number> = {};

    get channels() {
        return client.channels.cache.size;
    }

    get cpuUsage() {
        return cpuUsage();
    }

    get emojis() {
        return client.emojis.cache.size;
    }

    get guilds() {
        return client.guilds.cache.size;
    }

    get memoryUsage() {
        return memoryUsage();
    }

    get messages() {
        return this.botMessages + this.userMessages;
    }

    get readyAt() {
        return client.readyAt;
    }

    get readyTimestamp() {
        return client.readyTimestamp;
    }

    get shards() {
        return client.shard?.count ?? 0;
    }

    get shardId() {
        return client.shard?.ids[0] ?? 0;
    }

    get shardIds() {
        return client.shard?.ids ?? [];
    }

    get uptime() {
        return client.uptime;
    }

    get users() {
        return client.users.cache.size;
    }

    get voiceAdapters() {
        return client.voice.adapters.size;
    }

    get wsPing() {
        return client.ws.ping;
    }

    get wsStatus() {
        return client.ws.status;
    }

    async fetch() {
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
                }, <Record<typeof keys[number], number>>{});

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

    toJSON(): Stats {
        return {
            botMessages: this.botMessages,
            channels: this.channels,
            cpuUsage: this.cpuUsage,
            emojis: this.emojis,
            guilds: this.guilds,
            interactions: this.interactions,
            isLastShard: this.isLastShard,
            memoryUsage: this.memoryUsage,
            messages: this.messages,
            readyAt: this.readyAt,
            readyTimestamp: this.readyTimestamp,
            shards: this.shards,
            shardId: this.shardId,
            shardIds: this.shardIds,
            totalChannels: this.totalChannels,
            totalEmojis: this.totalEmojis,
            totalGuilds: this.totalGuilds,
            totalInteractions: this.totalInteractions,
            totalMemoryUsage: this.totalMemoryUsage,
            totalMessages: this.totalMessages,
            totalShards: this.totalShards,
            totalUsers: this.totalUsers,
            totalVoiceAdapters: this.totalVoiceAdapters,
            uptime: this.uptime,
            usedCommands: this.usedCommands,
            userMessages: this.userMessages,
            users: this.users,
            voiceAdapters: this.voiceAdapters,
            wsPing: this.wsPing,
            wsStatus: this.wsStatus
        };
    }
}