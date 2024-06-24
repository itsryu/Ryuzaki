import { Ryuzaki } from '../../RyuzakiClient';
import { ServiceStructure } from '../../Structures/';

export default class setActivityService extends ServiceStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: 'setActivity',
            initialize: true
        });
    }

    serviceExecute() {
        try {
            const activityArray = [
                `My name is ${this.client.user?.username}!`,
                'Use /ryu to know more about me!',
                'Use /help to know what i can do!',
                `${this.client.shard?.count} clusters`
            ];

            const typeArray = [0];
            const time = 15;
            let x = 0;
            let y = 0;

            setInterval(() => {
                const shardId = this.client.shard?.ids[Math.floor(Math.random() * this.client.shard.ids.length)];
                const shardGuilds = this.client.guilds.cache.filter(guild => guild.shardId === shardId).size;

                const newArray = activityArray.map(str => {
                    return `${str} | Shard ${shardId} [${shardGuilds.toLocaleString('en-US')}]`;
                });

                const activity = { name: newArray[x++ % activityArray.length], type: typeArray[y++ % typeArray.length] };
                this.client.user?.setPresence({ status: 'online', activities: [activity] });
            }, 1000 * time);

            this.client.logger.info(`${this.client.user?.username} presence has been successfully set.`, `Presence - ${this.client.shard?.ids[0]}`);
        } catch (err) {
            this.client.logger.error((err as Error).message, setActivityService.name);
            this.client.logger.warn((err as Error).stack, setActivityService.name);
        }
    }
}