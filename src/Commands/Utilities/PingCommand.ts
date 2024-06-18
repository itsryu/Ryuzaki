import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { PingCommandData } from '../../Data/Commands/Utilities/PingCommandData';
import { Colors, Message } from 'discord.js';
import { connection } from 'mongoose';

export default class pingCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, PingCommandData);
    }

    async commandExecute({ message }: { message: Message }) {
        const created = Math.round(Date.now() - message.createdTimestamp);
        const host = (await this.client.shard?.broadcastEval((client) => client.ws.ping))!;
        const database = await this.databasePing();
        
        const embed = new ClientEmbed(this.client)
            .setTitle('Pong! 🏓')
            .setDescription(`${this.client.t('utilities:ping.response')} \`${created}\`ms \n` + `${this.client.t('utilities:ping.host')} \`${host[message.guild?.shard.id ? message.guild.shard.id : 0]}\`ms \n` + `${this.client.t('utilities:ping.database')} \`${database}\`ms`);

        switch (true) {
            case (created >= 500):
                embed.setColor(Colors.Red);
                break;
            case (created <= 499):
                embed.setColor(Colors.Yellow);
                break;
            case (created <= 299):
                embed.setColor(Colors.Green);
                break;
        }

        return void message.reply({ embeds: [embed] });
    }

    private async databasePing() {
        const start = process.hrtime();
        await connection.db.admin().command({ ping: 1 });
        const stop = process.hrtime(start);

        return Math.round((stop[0] * 1e9 + stop[1]) / 1e6);
    }
}