import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../Structures/';
import { Events, Guild, WebhookClient } from 'discord.js';

export default class guildDeleteListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.GuildDelete
        });
    }

    async eventExecute(guild: Guild) {
        try {
            const guildOwner = await guild.fetchOwner();
            const webhook = new WebhookClient({ url: process.env.WEBHOOK_LOG_REMOVED_URL });

            const embed = new ClientEmbed(this.client)
                .setThumbnail(guild.iconURL({ extension: 'png', size: 4096 }))
                .setAuthor({ name: `Removed from a guild - ${guild.client.user.username}`, iconURL: guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
                .addFields(
                    {
                        name: 'Guild:',
                        value: `\`${guild.name}\` \`(${guild.id})\``,
                        inline: true
                    },
                    {
                        name: 'Owner:',
                        value: `${guildOwner} \`(${guildOwner.id})\``,
                        inline: false
                    },
                    {
                        name: 'Total users:',
                        value: `\`${guild.memberCount}\``,
                        inline: false
                    },
                    {
                        name: 'Total channels:',
                        value: `\`${guild.channels.cache.size}\``,
                        inline: true
                    });

            webhook.send({ embeds: [embed] });
        } catch (err) {
            this.client.logger.error((err as Error).message, guildDeleteListener.name);
            this.client.logger.warn((err as Error).stack!, guildDeleteListener.name);
        }
    }
}