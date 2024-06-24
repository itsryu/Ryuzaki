import { Message } from 'discord.js';
import { TestCommandData } from '../../Data/Commands/Developer/TestCommandData';
import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../Structures/';

export default class TestCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, TestCommandData);
    }

    public commandExecute({ message }: { message: Message, args: string[] }) {
        try {
            this.client.logger.debug(message.content, TestCommand.name);
        } catch (err) {
            this.client.logger.error((err as Error).message, TestCommand.name);
            this.client.logger.warn((err as Error).stack, TestCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}