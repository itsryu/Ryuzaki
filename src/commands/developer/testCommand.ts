import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { TestCommandData } from '../../data/commands/developer/testCommandData';
import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure } from '../../structures';
import { Logger } from '../../utils/logger';

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