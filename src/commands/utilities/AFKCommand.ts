import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure } from '../../Structures/';
import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { AFKCommandData } from '../../data/commands/utilities/AFKCommandData';
import { Logger } from '../../Utils/logger';

export default class AFKCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, AFKCommandData);
    }

    async commandExecute({ message, args }: { message: OmitPartialGroupDMChannel<Message>, args: string[] }) {
        try {
            const userData = await this.client.getData(message.author.id, 'user');

            if (!userData) {
                return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {
                const reason = args.join(' ') || null;

                userData.set({
                    'AFK.away': true,
                    'AFK.lastNickname': message.member?.nickname ? message.member.nickname : message.author.username,
                    'AFK.reason': reason
                });

                await userData.save();

                message.member?.setNickname(`[AFK] ${message.member.nickname ?? message.author.username}`).catch(() => undefined);
                return void await message.reply({ content: this.client.t('utilities:AFK.success') });
            }
        } catch (err) {
            Logger.error((err as Error).message, AFKCommand.name);
            Logger.warn((err as Error).stack, AFKCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}