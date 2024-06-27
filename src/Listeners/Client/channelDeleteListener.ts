import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure } from '../../Structures/';
import { Events, NonThreadGuildBasedChannel } from 'discord.js';

export default class ChannelDeleteListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.ChannelDelete
        });
    }

    async eventExecute(channel: NonThreadGuildBasedChannel) {
        try {
            const channelData = await this.client.getData(channel.guild.id, 'guild');
            
            if (channelData) {
                const objectChannels = Object.entries(channelData.serverstats.channels);
                const updatedObject = objectChannels.filter(([, c]) => c === channel.id).reduce((o, [key]) => Object.assign(o, { [`serverstats.channels.${key}`]: null }), {});

                await this.client.database.guilds.findOneAndUpdate({ guildID: channel.guild.id },
                    updatedObject
                );
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, ChannelDeleteListener.name);
            this.client.logger.warn((err as Error).stack, ChannelDeleteListener.name);
        }
    }
}