import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../../src/Structures/';
import { ShardCommandData } from '../../Data/Commands/Infos/ShardCommandData';
import { Languages } from '../../Types/ClientTypes';
import { Client, Message } from 'discord.js';
import Ascii from 'ascii-table';
import Day from 'dayjs';

export default class ShardCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, ShardCommandData);
    }

    async commandExecute({ message, language }: { message: Message, language: Languages }) {
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
                ram = (await this.client.shard?.broadcastEval(() => process.memoryUsage().rss))!,
                guilds = (await this.client.shard?.broadcastEval((client: Client) => client.guilds.cache.size))!,
                users = (await this.client.shard?.broadcastEval((client: Client) => client.users.cache.size))!,
                shardCount = this.client.shard?.count!;

            for (let i = 0; i < shardCount; i++) {
                table.addRow(i, Day.duration(-uptime[i]).locale(language).humanize(true), '~' + Math.round(ping[i]) + 'ms', this.client.utils.bytesToSize(ram[i], 2), guilds[i].toLocaleString(language), users[i].toLocaleString(language));
            }

            const botGuilds = guilds.reduce((prev, val) => prev + val),
                botUsers = users.reduce((prev, val) => prev + val),
                ramTotal = ram.reduce((prev, val) => prev + val),
                pingG = ping.reduce((prev, val) => prev + val),
                media = pingG / shardCount;

            table.addRow('______', '______', '______', '______', '______', '______');
            table.addRow('MEDIA', '-', '~' + Math.round(media) + 'ms', this.client.utils.bytesToSize(ramTotal, 2), botGuilds.toLocaleString(language), botUsers.toLocaleString(language));

            await message.reply({ content: `\`\`\`prolog\n${table.toString()}\`\`\`` });

            table.clearRows();
        } catch (err) {
            this.client.logger.error((err as Error).message, ShardCommand.name);
            this.client.logger.warn((err as Error).stack, ShardCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}