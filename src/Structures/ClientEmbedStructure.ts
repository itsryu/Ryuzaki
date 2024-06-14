import { Ryuzaki } from '../RyuzakiClient';
import { ColorResolvable, EmbedBuilder } from 'discord.js';
import { APIEmbed } from 'discord-api-types/v10';

class ClientEmbed extends EmbedBuilder {
    constructor(client: Ryuzaki, data?: APIEmbed) {
        super(data);
        this.setColor(process.env.EMBED_COLOR as ColorResolvable);
        this.setFooter({ text: `${client.user?.username}©`, iconURL: client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });
        this.setTimestamp();
    }
}

export { ClientEmbed };