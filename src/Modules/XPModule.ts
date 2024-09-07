import { ModuleStructure } from '../Structures';
import { Message } from 'discord.js';
import { Logger } from '../Utils/logger';

export default class XPModule extends ModuleStructure {
    async moduleExecute({ message }: { message: Message }) {
        try {
            const userData = await this.client.getData(message.author.id, 'user');

            if (userData) {
                try {
                    const xp = userData.exp.xp;
                    const totalXp = userData.exp.totalXp;
                    const level = userData.exp.level;
                    const nextLevelXP = userData.exp.nextLevel;
                    const xpGive = Math.floor(Math.random() * 50);
                    const xpExtra = Math.floor(Math.random() * 80);
                    const xpTotalReceived = userData.vip.status ? (xpGive + xpExtra) : xpGive;

                    userData.set({
                        'exp.xp': xp + xpTotalReceived,
                        'exp.totalXp': totalXp + xpTotalReceived
                    });

                    await userData.save();

                    if (xp >= nextLevelXP) {
                        userData.set({
                            'exp.xp': 0,
                            'exp.level': level + 1,
                            'exp.nextLevel': this.client.utils.nextLevelExp(level + 1)
                        });

                        await userData.save();

                        return void message.reply({ content: `Você acaba de subir para o nível **${level + 1}**.` })
                            .then(async (message) => { await message.react('⬆️'); });
                    }

                } catch (err) {
                    Logger.error((err as Error).message, XPModule.name);
                    Logger.warn((err as Error).stack, XPModule.name);
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, XPModule.name);
            Logger.warn((err as Error).stack, XPModule.name);
        }
    }
}