import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { PingCommandData } from '../../Data/Commands/Utilities/PingCommandData';
import { Colors, Message } from 'discord.js';

export default class pingCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, PingCommandData);
    }

    commandExecute({ message }: { message: Message }) {
        const created = Math.round(Date.now() - message.createdTimestamp);
        const host = Math.round(this.client.ws.ping);

        const embed = new ClientEmbed(this.client)
            .setTitle('Pong! 🏓')
            .setDescription(`${this.client.t('utilities:ping.response')} \`${created}\`ms \n` + `${this.client.t('utilities:ping.host')} \`${host}\`ms.`);

        switch (true) {
            case (created >= 500):
                embed.setColor(Colors.Red);
                break;
            case (created >= 300 && created <= 499):
                embed.setColor(Colors.Yellow);
                break;
            case (created <= 299):
                embed.setColor(Colors.Green);
                break;
        }

        return void message.reply({ embeds: [embed] });
    }
}