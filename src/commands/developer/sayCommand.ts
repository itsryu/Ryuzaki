import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { SayCommandData } from '../../data/commands/developer/sayCommandData';
import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure } from '../../structures';
import { Logger } from '../../utils';

export default class SayCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, SayCommandData);
    }

    public async commandExecute({ message, args }: { message: OmitPartialGroupDMChannel<Message>, args: string[] }) {
        try {
            const msg = args.join(' ');

            await message.delete();
            return void await message.channel?.send({ content: msg });
        } catch (err) {
            Logger.error((err as Error).message, SayCommand.name);
            Logger.warn((err as Error).stack, SayCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}