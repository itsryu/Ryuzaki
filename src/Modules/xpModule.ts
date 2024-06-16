import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure } from '../Structures/';
import { Message } from 'discord.js';

export default class xpModule extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

    async moduleExecute(message: Message) {
        if (message.guild) {
            const server = await this.client.getData(message.guild.id, 'guild');
            const user = await this.client.getData(message.author.id, 'user');

            if (!server.exp.roles.some((x) => message.member?.roles.cache.has(x)) || !server.exp.channels.some((x) => x === message.channel.id)) {
                try {
                    const xp = user.exp.xp;
                    const level = user.exp.level;
                    const nextLevel = user.exp.nextLevel * level;
                    const xpGive = Math.floor(Math.random() * 5);
                    const xpExtra = Math.floor(Math.random() * 20);
                    const xpTotalReceived = user.vip.status ? (xpGive + xpExtra) : xpGive;

                    await user.set({
                        'exp.xp': xp + xpTotalReceived,
                        'exp.id': message.author.id,
                        'exp.user': message.author.tag
                    }).save();

                    if (xp >= nextLevel) {
                        await user.set({
                            'exp.xp': 0,
                            'exp.level': level + 1
                        }).save();

                        if (server.exp.status) {
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