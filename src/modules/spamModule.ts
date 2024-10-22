import { ModuleStructure, ClientEmbed } from '../Structures';
import { Message, TextChannel } from 'discord.js';
import { Logger } from '../Utils/logger';
import ms from 'ms';

interface SpamMap {
    msgCount: number;
    lastMessage: Message;
    timer: NodeJS.Timeout;
}

export default class SpamModule extends ModuleStructure {
    private map = new Map<string, SpamMap>();

    async moduleExecute(message: Message) {
        try {
            if (message.guild) {
                const guildData = await this.client.getData(message.guild.id, 'guild');

                if (guildData) {
                    const { antispam, logs } = guildData;

                    if (antispam.status) {
                        const difference = 3000;
                        const limit = antispam.limit;
                        const time = antispam.timeout;

                        try {
                            if (this.map.has(message.author.id)) {
                                const data = this.map.get(message.author.id);

                                if (data) {
                                    const { lastMessage, timer, msgCount } = data;
                                    const diff = message.createdTimestamp - lastMessage.createdTimestamp;

                                    if (diff >= difference) {
                                        clearTimeout(timer);
                                        this.map.set(message.author.id, { msgCount: 1, lastMessage: message, timer: setTimeout(() => this.map.delete(message.author.id), time) });
                                    } else {
                                        const newCount = msgCount + 1;

                                        if (newCount === limit) {
                                            this.map.delete(message.author.id);

                                            if (!antispam.channels.includes(message.channel.id)) {
                                                const embed = new ClientEmbed(this.client)
                                                    .setDescription(`Você está enviando muitas mensagens simultaneamente, você foi mutado e será desmutado em **${ms(time)}**.`);

                                                const log = new ClientEmbed(this.client)
                                                    .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 4096 }))
                                                    .setDescription(`O usuário \`${message.author.tag} (${message.author.id})\` estava enviando muitas mensagens simultaneamente, ele foi mutado e será desmutado em \`${ms(time)}\`.`);

                                                message.member?.timeout(time, `Membro castigado automaticamente pelo sistema anti-spam do ${this.client.user?.username}.`)
                                                    .then(async () => {
                                                        await message.reply({ embeds: [embed] });

                                                        if (logs.status && logs.moderation) {
                                                            const channel = message.guild?.channels.cache.get(logs.channel) as TextChannel;
                                                            await channel.send({ embeds: [log] });
                                                        }
                                                    })
                                                    .catch(() => undefined);
                                            }
                                        } else {
                                            this.map.set(message.author.id, { msgCount: newCount, lastMessage, timer });
                                        }
                                    }
                                }
                            } else {
                                this.map.set(message.author.id, { msgCount: 1, lastMessage: message, timer: setTimeout(() => this.map.delete(message.author.id), time) });
                            }
                        } catch (err) {
                            Logger.error((err as Error).message, SpamModule.name);
                            Logger.warn((err as Error).stack, SpamModule.name);
                        }
                    }
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, SpamModule.name);
            Logger.warn((err as Error).stack, SpamModule.name);
        }
    }
}