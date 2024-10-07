import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../Structures/';
import { PurgeCommandData } from '../../Data/Commands/Utilities/PurgeCommandData';
import { Message, Collection, OmitPartialGroupDMChannel } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class purgeCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, PurgeCommandData);
    }

    public async commandExecute({ message, args }: { message: OmitPartialGroupDMChannel<Message>, args: string[] }) {
        try {
            const amount = args[0];
            const limit = Number.isInteger(Number(amount)) ? Math.min(parseInt(amount), 100) : undefined;

            if (!limit) {
                return void message.reply({ content: this.client.t('utilities:purge:errors.args') });
            } else {
                const userMessage = await message.channel.messages.fetch().then((msg: Collection<string, Message>) => msg.filter(msg => msg.author.id === message.author.id).first(limit + 1));

                return void await Promise.all(
                    userMessage.map(async (msg) => {
                        await msg.delete()
                            .then(async () => {
                                await message.channel.send({ content: this.client.t('utilities:purge.success', { size: userMessage.length - 1 }) })
                                    .then((replyMessage: Message) => setTimeout(async () => await replyMessage.delete(), 5000));
                            });
                    }
                    )
                );
            }
        } catch (err) {
            Logger.error((err as Error).message, purgeCommand.name);
            Logger.warn((err as Error).stack, purgeCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}