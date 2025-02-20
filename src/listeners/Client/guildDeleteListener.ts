import { Ryuzaki } from '../../ryuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../structures/';
import { Events, Guild, WebhookClient } from 'discord.js';
import { Logger } from '../../utils';

export default class GuildDeleteListener extends ListenerStructure {
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

            await webhook.send({ embeds: [embed] });
        } catch (err) {
            Logger.error((err as Error).message, GuildDeleteListener.name);
            Logger.warn((err as Error).stack, GuildDeleteListener.name);
        }
    }
}