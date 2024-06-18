import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure } from '../Structures/';
import { Message } from 'discord.js';

export default class xpModule extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

    async moduleExecute(message: Message) {
        if (message.guild) {
            const guildData = await this.client.getData(message.guild.id, 'guild');
            const userData = await this.client.getData(message.author.id, 'user');

            if (guildData && userData) {
                if (!guildData.exp.roles.some((id) => message.member?.roles.cache.has(id)) || !guildData.exp.channels.some((id) => message.channel.id === id)) {
                    try {
                        const xp = userData.exp.xp;
                        const level = userData.exp.level;
                        const nextLevel = userData.exp.nextLevel * level;
                        const xpGive = Math.floor(Math.random() * 5);
                        const xpExtra = Math.floor(Math.random() * 20);
                        const xpTotalReceived = userData.vip.status ? (xpGive + xpExtra) : xpGive;

                        await userData.set({
                            'exp.xp': xp + xpTotalReceived,
                            'exp.id': message.author.id,
                            'exp.user': message.author.tag
                        }).save();

                        if (xp >= nextLevel) {
                            await userData.set({
                                'exp.xp': 0,
                                'exp.level': level + 1
                            }).save();

                            if (guildData.exp.status) {
                                return void message.reply({ content: `Você acaba de subir para o nível **${level}**.` })
                                    .then(message => message.react('⬆️'));
                            }
                        }
                    } catch (err) {
                        this.client.logger.error((err as Error).message, xpModule.name);
                        this.client.logger.warn((err as Error).stack!, xpModule.name);
                    }
                }
            }
        }
    }
}