import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { PingCommandData } from '../../data/commands/utilities/pingCommandData';
import { Colors, Message, OmitPartialGroupDMChannel } from 'discord.js';
import { connection } from 'mongoose';
import { Logger } from '../../Utils/logger';
import { Util } from '../../Utils/util';

export default class PingCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, PingCommandData);
    }

    async commandExecute({ message }: { message: OmitPartialGroupDMChannel<Message> }) {
        try {
            const created = Math.round(Date.now() - message.createdTimestamp);
            const host = await this.client.shard?.broadcastEval((client) => client.ws.ping);
            const databasePing = await Util.databasePing(connection);

            const embed = new ClientEmbed(this.client)
                .setTitle('Pong! 🏓')
                .setDescription(`${this.client.t('utilities:ping.response')} \`${created}\`ms \n` + `${this.client.t('utilities:ping.host')} \`${host?.[message.guild?.shard.id ? message.guild.shard.id : 0] ?? 0}\`ms \n` + `${this.client.t('utilities:ping.database')} \`${databasePing}\`ms`);

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

            return void await message.reply({ embeds: [embed] });
        } catch (err) {
            Logger.error((err as Error).message, PingCommand.name);
            Logger.warn((err as Error).stack, PingCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}