import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, ListenerStructure } from '../../Structures';
import { Events, WebhookClient, Colors } from 'discord.js';

export default class errorListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.Error
        });
    }

    async eventExecute(error: Error) {
        try {
            const webhook = new WebhookClient({ url: process.env.WEBHOOK_LOG_ERROR_URL });

            const errorEmbed = new ClientEmbed(this.client)
                .setColor(Colors.Red)
                .setTitle(`Error: [${error.name}]`)
                .setDescription('```js' + '\n' + (error.stack ?? error.message) + '\n' + '```')
                .setFooter({ text: `Cause: ${error.cause}`, iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });

            await webhook.send({ embeds: [errorEmbed] });
        } catch (err) {
            this.client.logger.error((err as Error).message, errorListener.name);
            this.client.logger.warn((err as Error).stack, errorListener.name);
        }
    }
}