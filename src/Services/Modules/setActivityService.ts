import { ActivitiesOptions, ActivityType, PresenceUpdateStatus } from 'discord.js';
import { Ryuzaki } from '../../RyuzakiClient';
import { ServiceStructure } from '../../Structures';
import { clientStats } from '../../Client';
import { Logger } from '../../Utils/logger';

export default class SetActivityService extends ServiceStructure {
    declare interval: NodeJS.Timeout;

    private readonly activities: ActivitiesOptions[] = [
        { name: `My name is ${this.client.user?.username}!`, type: ActivityType.Listening },
        { name: 'Use /ryu to know more about me!', type: ActivityType.Listening },
        { name: 'Use /help to know what i can do!', type: ActivityType.Listening },
        { name: `${clientStats.shards} shards`, type: ActivityType.Listening }
    ];

    constructor(client: Ryuzaki) {
        super(client, {
            name: 'SetActivity',
            initialize: true
        });
    }

    serviceExecute() {
        try {
            this.stop();
            this.setPresence(true);
            this.interval = setInterval(() => { this.setPresence(); }, 1000 * 60);
        } catch (err) {
            Logger.error((err as Error).message, SetActivityService.name);
            Logger.warn((err as Error).stack, SetActivityService.name);
        }
    }

    public setPresence(shard = this.random) {
        this.client.user?.setPresence({
            activities: shard ? this.shardActivities : this.activities,
            shardId: shard ? clientStats.shardId : undefined,
            status: PresenceUpdateStatus.Online
        });
    }

    private get random() {
        return Boolean(Math.round(Math.random()));
    }

    public get shardActivities(): ActivitiesOptions[] {
        return [{
            name: `Shard [${clientStats.shardId}] (${clientStats.shardId + 1}/${clientStats.shards})`,
            type: ActivityType.Listening
        }];
    }

    private stop() {
        clearInterval(this.interval);
    }
}