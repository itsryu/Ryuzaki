import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure } from '../../Structures/';
import { Events, GuildMember, TextChannel } from 'discord.js';

export default class guildMemberRemoveListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.GuildMemberRemove
        });
    }

    async eventExecute(member: GuildMember) {
        try {
            const guild = member.guild;
            const guildData = await this.client.getData(guild.id, 'guild');

            if (guildData && guildData.serverstats.status) {
                const st = guildData.serverstats;
                const ch = st.channels;

                if (ch.total != null) {
                    const channel = guild.channels.cache.get(ch.total) as TextChannel;

                    channel.setName(`Total: ${guild.memberCount.toLocaleString()}`);
                }

                if (ch.bot != null) {
                    const channel = guild.channels.cache.get(ch.bot) as TextChannel;

                    channel.setName(`Bots: ${guild.members.cache.filter((x) => x.user.bot).size.toLocaleString()}`);
                }

                if (ch.users != null) {
                    const channel = guild.channels.cache.get(ch.users) as TextChannel;

                    channel.setName(`Members: ${guild.members.cache.filter((x) => !x.user.bot).size.toLocaleString()}`);
                }
            }

            if (guildData && guildData.counter.status) {
                (this.client.channels.cache.get(guildData.counter.channel) as TextChannel).setTopic(guildData.counter.msg.replace(/{members}/g, this.client.utils.counter(guild.memberCount)).replace(/{guild}/g, guild.name));
            }

        } catch (err) {
            this.client.logger.error((err as Error).message, guildMemberRemoveListener.name);
            this.client.logger.warn((err as Error).stack!, guildMemberRemoveListener.name);
        }
    }
}