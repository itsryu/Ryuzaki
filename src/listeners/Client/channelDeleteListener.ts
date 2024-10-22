import { Ryuzaki } from '../../ryuzakiClient';
import { ListenerStructure } from '../../Structures/';
import { Events, NonThreadGuildBasedChannel } from 'discord.js';
import { Logger } from '../../Utils/logger';

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

                await Ryuzaki.database.guilds.findOneAndUpdate({ guildID: channel.guild.id },
                    updatedObject
                );
            }
        } catch (err) {
            Logger.error((err as Error).message, ChannelDeleteListener.name);
            Logger.warn((err as Error).stack, ChannelDeleteListener.name);
        }
    }
}