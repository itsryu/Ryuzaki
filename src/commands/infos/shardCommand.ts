import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure } from '../../structures';
import { ShardCommandData } from '../../data/commands/infos/shardCommandData';
import { Client, Message, OmitPartialGroupDMChannel } from 'discord.js';
import Ascii from 'ascii-table';
import Day from 'dayjs';
import { Bytes, Logger } from '../../utils';
import { Language } from '../../utils/objects';

export default class ShardCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, ShardCommandData);
    }

    async commandExecute({ message, language }: { message: OmitPartialGroupDMChannel<Message>, language: Language }) {
        try {
            const table = new Ascii('Shards Information');

            table.setHeading('SID', 'Uptime', 'Ping', 'Usage', 'Guilds', 'Users');

            table.setAlign(0, Ascii.CENTER);
            table.setAlign(1, Ascii.CENTER);
            table.setAlign(2, Ascii.CENTER);
            table.setAlign(3, Ascii.CENTER);
            table.setAlign(4, Ascii.CENTER);
            table.setAlign(5, Ascii.CENTER);

            table.setBorder('|', '-', '+', '+');

            const uptime = await this.client.shard?.broadcastEval((client: Client) => client.uptime) as number[],
                ping = (await this.client.shard?.broadcastEval((client: Client) => client.ws.ping))!,
                ram = (await this.client.shard?.broadcastEval(() => process.memoryUsage().heapUsed))!,
                guilds = (await this.client.shard?.broadcastEval((client: Client) => client.guilds.cache.size))!,
                users = (await this.client.shard?.broadcastEval((client: Client) => client.users.cache.size))!,
                shardCount = this.client.shard?.count ?? 0;

            for (let i = 0; i < shardCount; i++) {
                table.addRow(i, Day.duration(-uptime[i]).locale(language).humanize(true), '~' + Math.round(ping[i]) + 'ms', new Bytes(ram[i]), guilds[i].toLocaleString(language), users[i].toLocaleString(language));
            }

            const botGuilds = guilds.reduce((prev, val) => prev + val),
                botUsers = users.reduce((prev, val) => prev + val),
                ramTotal = ram.reduce((prev, val) => prev + val),
                pingG = ping.reduce((prev, val) => prev + val),
                media = pingG / shardCount;

            table.addRow('______', '______', '______', '______', '______', '______');
            table.addRow('TOTAL', '-', '~' + Math.round(media) + 'ms', new Bytes(ramTotal), botGuilds.toLocaleString(language), botUsers.toLocaleString(language));

            await message.reply({ content: `\`\`\`prolog\n${table.toString()}\`\`\`` });

            table.clearRows();
        } catch (err) {
            Logger.error((err as Error).message, ShardCommand.name);
            Logger.warn((err as Error).stack, ShardCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}