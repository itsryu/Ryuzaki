import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { TestCommandData } from '../../Data/Commands/Developer/TestCommandData';
import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../Structures/';
import { Logger } from '../../Utils/logger';

export default class TestCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, TestCommandData);
    }

    public commandExecute({ message }: { message: OmitPartialGroupDMChannel<Message>, args: string[] }) {
        try {
            Logger.debug(message.content, TestCommand.name);
        } catch (err) {
            Logger.error((err as Error).message, TestCommand.name);
            Logger.warn((err as Error).stack, TestCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}