import { Message } from 'discord.js';
import { TestCommandData } from '../../Data/Commands/Developer/TestCommandData';
import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../Structures/';

export default class TestCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, TestCommandData);
    }

    public async commandExecute({ message }: { message: Message, args: string[] }) {
        this.client.logger.debug(message.content, TestCommand.name);
    }
}