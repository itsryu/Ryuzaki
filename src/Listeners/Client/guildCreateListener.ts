import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../Structures';
import { Guild, ChannelType, PermissionFlagsBits, Events, GuildInvitableChannelResolvable, WebhookClient } from 'discord.js';
import { Languages } from '../../Types/ClientTypes';
import { Logger } from '../../Utils/logger';

export default class GuildCreateListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.GuildCreate
        });
    }

    async eventExecute(guild: Guild) {
        try {
            const guildOwner = await guild.fetchOwner();
            const webhook = new WebhookClient({ url: process.env.WEBHOOK_LOG_ADDED_URL });
            const guildData = await this.client.getData(guild.id, 'guild');
            const languages: Languages[] = ['pt-BR', 'en-US'];

            const embed = new ClientEmbed(this.client)
                .setThumbnail(guild.iconURL({ extension: 'png', size: 4096 }))
                .setAuthor({ name: `Added to a guild - ${guild.client.user.username}`, iconURL: guild.iconURL({ extension: 'png', size: 4096 }) ?? undefined })
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

            await guildData?.updateOne({ $set: { lang: languages.some((lang) => lang === guild.preferredLocale) ? guild.preferredLocale : 'en-US' } }, { new: true });

            if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
                const channels = await guild.channels.fetch();
                const firstChannel = channels.filter((ch) => ch && ch.rawPosition === 0 && ch.type === ChannelType.GuildText).first();

                if (firstChannel) {
                    await guild.invites.create(firstChannel as GuildInvitableChannelResolvable, {
                        maxAge: 0,
                        unique: true
                    }).then((invite) => {
                        embed.setTitle(guild.name);
                        embed.setURL(invite.url);
                    }).catch(() => undefined);
                }
            }

            await webhook.send({ embeds: [embed] });
        } catch (err) {
            Logger.error((err as Error).message, GuildCreateListener.name);
            Logger.warn((err as Error).stack, GuildCreateListener.name);
        }
    }
}