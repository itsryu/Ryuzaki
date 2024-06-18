import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../Structures/';
import { Message } from 'discord.js';
import { AFKCommandData } from '../../Data/Commands/Utilities/AFKCommandData';

export default class AFKCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, AFKCommandData);
    }

    async commandExecute({ message, args }: { message: Message, args: string[] }) {
        const userData = await this.client.getData(message.author.id, 'user');

        if (!userData) {
            return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
        } else {
            const reason = args.join(' ') || null;

            await userData.set({
                'AFK.away': true,
                'AFK.lastNickname': message.member?.nickname ? message.member.nickname : message.author.username,
                'AFK.reason': reason
            }).save();

            message.member?.setNickname(`[AFK] ${message.member.nickname ?? message.author.username}`).catch(() => { });
            return void message.reply({ content: this.client.t('utilities:AFK.success') });
        }
    }
}