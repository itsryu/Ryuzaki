import { Message } from 'discord.js';
import { SayCommandData } from '../../Data/Commands/Developer/SayCommandData';
import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../Structures/';

export default class SayCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, SayCommandData);
    }

    public async commandExecute({ message, args }: { message: Message, args: string[] }) {
        try {
            const msg = args.join(' ');

            await message.delete();
            return void await message.channel.send({ content: msg });
        } catch (err) {
            this.client.logger.error((err as Error).message, SayCommand.name);
            this.client.logger.warn((err as Error).stack, SayCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}