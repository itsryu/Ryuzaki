import { ModuleStructure } from '../Structures';
import { Message } from 'discord.js';

export default class XPModule extends ModuleStructure {
    async moduleExecute(message: Message) {
        try {
            if (message.guild) {
                const guildData = await this.client.getData(message.guild.id, 'guild');
                const userData = await this.client.getData(message.author.id, 'user');

                if (guildData && userData) {
                    if (!guildData.exp.roles.some((id) => message.member?.roles.cache.has(id)) || !guildData.exp.channels.some((id) => message.channel.id === id)) {
                        try {
                            const xp = userData.exp.xp;
                            const level = userData.exp.level;
                            const nextLevel = userData.exp.nextLevel;
                            const xpGive = Math.floor(Math.random() * 5);
                            const xpExtra = Math.floor(Math.random() * 20);
                            const xpTotalReceived = userData.vip.status ? (xpGive + xpExtra) : xpGive;

                            userData.set({
                                'exp.xp': xp + xpTotalReceived,
                                'exp.id': message.author.id,
                                'exp.user': message.author.tag
                            });

                            await userData.save();

                            if (xp >= nextLevel) {
                                userData.set({
                                    'exp.xp': 0,
                                    'exp.level': level + 1,
                                    'exp.nextLevel': this.client.utils.nextLevelExp(level + 1)
                                });

                                await userData.save();

                                if (guildData.exp.status) {
                                    return void message.reply({ content: `Você acaba de subir para o nível **${level.toString()}**.` })
                                        .then(message => message.react('⬆️'));
                                }
                            }
                        } catch (err) {
                            this.client.logger.error((err as Error).message, XPModule.name);
                            this.client.logger.warn((err as Error).stack, XPModule.name);
                        }
                    }
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, XPModule.name);
            this.client.logger.warn((err as Error).stack, XPModule.name);
        }
    }
}