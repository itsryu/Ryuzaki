import { ModuleStructure, ClientEmbed } from '../Structures';
import { TextChannel } from 'discord.js';
import { Reminder } from '../Types/SchemaTypes';
import { Logger } from '../Utils/logger';
import { Ryuzaki } from '../RyuzakiClient';

export default class ReminderModule extends ModuleStructure {
    moduleExecute() {
        try {
            this.reminderInterval();
        } catch (err) {
            Logger.error((err as Error).message, ReminderModule.name);
            Logger.warn((err as Error).stack, ReminderModule.name);
        }
    }

    reminderInterval() {
        setInterval(async () => {
            const remindersList = await Ryuzaki.database.users.find({ 'reminder.reminderList.0': { $exists: true } });

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

                if (list && user) {
                    try {
                        const listPromise = list.map(async ([, x]) => {
                            try {
                                const channel = await this.client.channels.fetch(x.channel).catch(async () => { await this.removeReminder(id, list); }) as TextChannel | null;

                                if (channel && user) {
                                    embed.addFields(
                                        {
                                            name: '<a:lembrete:1042905549651579030> Lembrete:',
                                            value: `\`${x.reminder}\``
                                        })
                                        .setFooter({ text: `Lembrete de ${user.tag}`, iconURL: user.displayAvatarURL({ extension: 'png', size: 4096 }) });

                                    if (userData.reminder.isDm) {
                                        user.send({ content: `${user}`, embeds: [embed] })
                                            .catch(async () => {
                                                await channel.send({ content: `${user}, não pude enviar o lembrete em sua DM.`, embeds: [embed] });
                                            });
                                    } else {
                                        await channel.send({ content: `${user}`, embeds: [embed] });
                                    }

                                    await this.removeReminder(id, list);
                                }
                            } catch (err) {
                                Logger.error((err as Error).message, ReminderModule.name);
                                Logger.warn((err as Error).stack, ReminderModule.name);
                            }
                        });

                        await Promise.all(listPromise);
                    } catch (err) {
                        Logger.error((err as Error).message, ReminderModule.name);
                        Logger.warn((err as Error).stack, ReminderModule.name);
                    }
                }
            }
        });
    }

    async removeReminder(id: string, list: [string, Reminder][]) {
        try {
            const listPromise = list.map(async ([, x]) => {
                try {
                    const userData = await this.client.getData(id, 'user');

                    if (userData) {
                        await userData.updateOne({ _id: id }, { $pull: { 'reminder.reminderList': { time: x.time } } });
                    }
                } catch (err) {
                    Logger.error((err as Error).message, [ReminderModule.name, this.removeReminder.name]);
                    Logger.warn((err as Error).stack, [ReminderModule.name, this.removeReminder.name]);
                }
            });

            await Promise.all(listPromise);
        } catch (err) {
            Logger.error((err as Error).message, [ReminderModule.name, this.removeReminder.name]);
            Logger.warn((err as Error).stack, [ReminderModule.name, this.removeReminder.name]);
        }
    }
}