import { Message } from 'discord.js';
import { SayCommandData } from '../../Data/Commands/Developer/SayCommandData';
import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../Structures/';

export default class SayCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, SayCommandData);
    }

    public commandExecute({ message, args }: { message: Message, args: string[] }) {
        const msg = args.join(' ');

        message.delete();
        message.channel.send({ content: msg });
    }
}