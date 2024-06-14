import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure } from '../Structures/';
import { Message } from 'discord.js';

export default class afkModule extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

    async moduleExecute(message: Message) {
        try {
            await this.mentionedAFK(message);
        } catch (err) {
            this.client.logger.error((err as Error).message, afkModule.name);
            this.client.logger.warn((err as Error).stack!, afkModule.name);
        }
    }

    async mentionedAFK(message: Message) {
        const user = message.mentions?.users.first();

        if (user) {
            const userDb = await this.client.getData(user.id, 'user');
            const { AFK } = userDb;

            if (AFK.away) {
                return void message.reply({ content: `✋・${message.author}, o usuário **${user.username}** está AFK` + AFK.reason ? `\nMotivo: \`${AFK.reason}\`` : '.' });
            }
        } else {
            await this.authorAFK(message);
        }
    }

    async authorAFK(message: Message) {
        const userDb = await this.client.getData(message.author.id, 'user');
        const { AFK } = userDb;

        if (AFK.away) {
            await userDb.updateOne({ _id: message.author.id }, {
                $set: { 'AFK.away': false, 'AFK.reason': null },
                new: true
            });

            message.member?.setNickname(userDb.AFK.lastNickname ?? message.author.username).catch(() => undefined);
            return void message.reply({ content: `🤗・${message.author}, você não está mais AFK!` });
        }
    }
}