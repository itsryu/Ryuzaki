import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, ListenerStructure } from '../../Structures';
import { Events, CloseEvent, WebhookClient, Colors } from 'discord.js';

export default class shardDisconnectListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.ShardDisconnect
        });
    }

    eventExecute(event: CloseEvent, id: number) {
        try {
            const webhook = new WebhookClient({ url: process.env.WEBHOOK_LOG_ERROR_URL });

            const errorEmbed = new ClientEmbed(this.client)
                .setColor(Colors.Red)
                .setTitle(`Shard: [${id}]`)
                .setDescription('```js' + '\n' + event.reason + '\n' + '```')
                .setFooter({ text: `Code: ${event.code}`, iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });

            webhook.send({ embeds: [errorEmbed] });
        } catch (err) {
            this.client.logger.error((err as Error).message, shardDisconnectListener.name);
            this.client.logger.warn((err as Error).stack!, shardDisconnectListener.name);
        }
    }
}