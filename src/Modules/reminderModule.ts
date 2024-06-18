import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure, ClientEmbed } from '../Structures/';
import { TextChannel } from 'discord.js';

export default class ReminderModule extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

    moduleExecute() {
        try {
            this.reminderInterval();
        } catch (err) {
            this.client.logger.error((err as Error).message, ReminderModule.name);
            this.client.logger.warn((err as Error).stack!, ReminderModule.name);
        }
    }

    reminderInterval() {
        setInterval(async () => {
            const remindersList = await this.client.database.users.find({ 'reminder.reminderList.0': { $exists: true } });

            if (remindersList) {
                const membersList = Object.entries(remindersList).filter(([, x]) => x.reminder.reminderList.map((x) => x.time <= Date.now()));
                const list = membersList.map(([, x]) => x._id);

                this.reminderFind(list);
            }
        }, 1000 * 5);
    }

    reminderFind(list: string[]) {
        list.forEach(async (id) => {
            const userData = await this.client.getData(id, 'user');

            if (userData) {
                const list = Object.entries(userData.reminder.reminderList).filter(([, x]) => x.time <= Date.now());
                const user = await this.client.users.fetch(id).catch(() => undefined);

                const embed = new ClientEmbed(this.client)
                    .setColor(0xFFB32B);

                if (list) {
                    list.map(async ([, x]) => {
                        const channel = await this.client.channels.fetch(x.channel).catch(async () => { await this.removeReminder(id, list); }) as TextChannel;

                        if (channel && user) {
                            embed.addFields(
                                {
                                    name: '<a:lembrete:1042905549651579030> Lembrete:',
                                    value: `\`${x.reminder}\``
                                })
                                .setFooter({ text: `Lembrete de ${user.tag}`, iconURL: user.displayAvatarURL({ extension: 'png', size: 4096 }) });

                            if (userData.reminder.isDm) {
                                user.send({ content: `${user}`, embeds: [embed] })
                                    .catch(() => {
                                        channel.send({ content: `${user}, não pude enviar o lembrete em sua DM.`, embeds: [embed] });
                                    });
                            } else {
                                channel.send({ content: `${user}`, embeds: [embed] });
                            }

                            this.removeReminder(id, list);
                        }
                    });
                }
            }
        });
    }

    removeReminder(id: string, list: [string, any][]) {
        list.map(async ([, x]) => {
            const userData = await this.client.getData(id, 'user');

            if (userData) {
                await userData.updateOne({ _id: id }, { $pull: { 'reminder.reminderList': { time: x.time } } });
            }
        });
    }
}