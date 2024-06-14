import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure } from '../../Structures/';
import { Events, NonThreadGuildBasedChannel } from 'discord.js';

export default class channelDeleteListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.ChannelDelete
        });
    }

    async eventExecute(channel: NonThreadGuildBasedChannel) {
        try {
            const channels = await this.client.getData(channel.guild.id, 'guild');
            const objectChannels = Object.entries(channels.serverstats.channels);
            const updatedObject = objectChannels.filter(([, c]) => c === channel.id).reduce((o, [key]) => Object.assign(o, { [`serverstats.channels.${key}`]: null }), {});

            await this.client.database.guilds.findOneAndUpdate({ guildID: channel.guild.id },
                updatedObject
            );
        } catch (err) {
            this.client.logger.error((err as Error).message, channelDeleteListener.name);
            this.client.logger.warn((err as Error).stack!, channelDeleteListener.name);
        }
    }
}