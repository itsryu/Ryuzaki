import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../Structures/';
import { PurgeCommandData } from '../../Data/Commands/Utilities/PurgeCommandData';
import { Message, TextChannel, Collection } from 'discord.js';

export default class purgeCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, PurgeCommandData);
    }

    public async commandExecute({ message, args }: { message: Message, args: string[] }) {
        const amount = args[0];
        const limit = Number.isInteger(Number(amount)) ? Math.min(parseInt(amount), 100) : undefined;

        if (!limit) {
            return void message.reply({ content: this.client.t('utilities:purge:errors.args') });
        } else {
            const userMessage = await message.channel.messages.fetch().then((msg: Collection<string, Message>) => msg.filter(msg => msg.author.id === message.author.id).first(limit + 1));

            return void (message.channel as TextChannel).bulkDelete(userMessage, true)
                .then(messages => {
                    message.channel.send({ content: this.client.t('utilities:purge.success', { size: messages.size - 1 }) })
                        .then((replyMessage: Message) => setTimeout(() => replyMessage.delete(), 5000))
                        .catch(() => undefined);
                });
        }
    }
}