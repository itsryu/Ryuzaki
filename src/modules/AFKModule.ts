import { ModuleStructure } from '../structures';
import { Message } from 'discord.js';
import { Logger } from '../utils';

export default class AFKModule extends ModuleStructure {
    async moduleExecute(message: Message) {
        try {
            await this.mentionedAFK(message);
        } catch (err) {
            Logger.error((err as Error).message, AFKModule.name);
            Logger.warn((err as Error).stack, AFKModule.name);
        }
    }

    async mentionedAFK(message: Message) {
        const user = message.mentions?.users?.first() ?? message.mentions?.repliedUser;

        if (user) {
            const userData = await this.client.getData(user.id, 'user');

            if (userData) {
                const { AFK } = userData;

                if (AFK.away) {
                    return void message.reply({ content: `✋・${message.author}, o usuário \`${user.username}\` está AFK` + (AFK.reason ? `\n📝・Motivo: \`${AFK.reason}\`` : '.') });
                }
            }
        } else {
            await this.authorAFK(message);
        }
    }

    async authorAFK(message: Message) {
        const userData = await this.client.getData(message.author.id, 'user');

        if (userData) {
            const { AFK } = userData;

            if (AFK.away) {
                await userData.set({
                    'AFK.away': false,
                    'AFK.reason': null,
                    'AFK.lastNickname': AFK.lastNickname
                }).save();

                message.member?.setNickname(userData.AFK.lastNickname ?? message.author.username).catch(() => undefined);
                return void message.reply({ content: `🤗・${message.author}, você não está mais AFK!` });
            }
        }
    }
}