import { ModuleStructure } from '../../Structures';
import { ActionRowBuilder, ButtonBuilder, ChannelType, ButtonInteraction, ButtonStyle, TextChannel, MessageComponentInteraction } from 'discord.js';
import { writeFileSync, readdirSync, statSync } from 'node:fs';
import { Languages } from '../../types/clientTypes';
import { Logger } from '../../Utils/logger';
import { Util } from '../../Utils/util';

export default class CloseTicketButton extends ModuleStructure {
    async moduleExecute(interaction: ButtonInteraction, language: Languages) {
        try {
            if (interaction.guild && interaction.channel) {
                const userData = await this.client.getData(interaction.user.id, 'user');
                const guildData = await this.client.getData(interaction.guild.id, 'guild');

                const save = new ButtonBuilder()
                    .setCustomId('save')
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Enviar')
                    .setEmoji('💾');

                const not_save = new ButtonBuilder()
                    .setCustomId('not_save')
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('Não')
                    .setEmoji('❌');

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(save, not_save);
                const msg = await interaction.reply({ content: 'Você quer que eu envie o `log desse ticket` em seu privado?', components: [row], fetchReply: true });
                const filter = (i: MessageComponentInteraction) => (i.user.id === interaction.user.id && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                const collector = msg.createMessageComponentCollector({ filter });
                const messages = await (interaction.channel as TextChannel).messages.fetch();
                const log = messages.filter((m) => !m.author.bot).map((m) => {
                    return `[${Util.getTime(m.createdTimestamp, language, 'America/Sao_Paulo')}] ` + `${m.author.tag}: ` + m.content;
                }).reverse().join('\n');

                writeFileSync(`./src/Logs/log-${interaction.user.id}.txt`, log);

                const logFile = readdirSync('./src/Logs').filter((file) => file === `log-${interaction.user.id}.txt`).toString();
                const pathFile = `./src/Logs/${logFile}`;
                const size = statSync(pathFile).size;

                collector.on('collect', async (i) => {
                    if (i.customId == 'save') {
                        if (size > 0) {
                            interaction.user.send({ content: 'Aqui está o `log do ticket`:', files: [pathFile] })
                                .then(async () => {
                                    if (interaction.channel?.type === ChannelType.DM) return;
                                    return await interaction.followUp('O arquivo foi enviado em seu privado! 📑');
                                })
                                .catch(async () => {
                                    return await interaction.followUp({ content: 'Não pude enviar o arquivo em sua DM, então aqui esta ele:', files: [pathFile] });
                                });

                            if (guildData && guildData.logs.status && guildData.logs.moderation) {
                                const channel = interaction.guild?.channels.cache.get(guildData.logs.channel) as TextChannel;
                                channel.send({ files: [pathFile] }).catch(() => undefined);
                            }

                            await interaction.followUp('Irei `fechar o ticket e deletar o canal` daqui `15 segundos`.');

                            setTimeout(async () => {
                                try {
                                    userData?.set({
                                        'ticket.have': false,
                                        'ticket.channel': null
                                    });
                                    await userData?.save();

                                    await interaction.channel?.delete();
                                } catch (err) {
                                    Logger.error((err as Error).message, CloseTicketButton.name);
                                    Logger.warn((err as Error).stack, CloseTicketButton.name);
                                }
                            }, 15000);
                        } else {
                            await interaction.followUp('O seu ticket não apresenta conversas. Irei `fechar o ticket e deletar` o canal daqui `5 segundos`.');

                            setTimeout(async () => {
                                try {
                                    userData?.set({
                                        'ticket.have': false,
                                        'ticket.channel': null
                                    });
                                    await userData?.save();

                                    await interaction.channel?.delete();
                                } catch (err) {
                                    Logger.error((err as Error).message, CloseTicketButton.name);
                                    Logger.warn((err as Error).stack, CloseTicketButton.name);
                                }
                            }, 5000);
                        }
                    }

                    if (i.customId == 'not_save') {
                        if (size > 0) {
                            if (guildData && guildData.logs.status && guildData.logs.moderation) {
                                const channel = interaction.guild?.channels.cache.get(guildData.logs.channel) as TextChannel;
                                await channel.send({ files: [pathFile] }).catch(() => undefined);
                            }

                            await interaction.followUp('Irei `fechar o ticket e deletar` o canal daqui `5 segundos`.');

                            setTimeout(async () => {
                                try {
                                    userData?.set({
                                        'ticket.have': false,
                                        'ticket.channel': null
                                    });
                                    await userData?.save();

                                    await interaction.channel?.delete();
                                } catch (err) {
                                    Logger.error((err as Error).message, CloseTicketButton.name);
                                    Logger.warn((err as Error).stack, CloseTicketButton.name);
                                }
                            }, 5000);
                        } else {
                            await interaction.followUp('Irei `fechar o ticket e deletar` o canal daqui `5 segundos`.');

                            setTimeout(async () => {
                                try {
                                    userData?.set({
                                        'ticket.have': false,
                                        'ticket.channel': null
                                    });
                                    await userData?.save();

                                    await interaction.channel?.delete();
                                } catch (err) {
                                    Logger.error((err as Error).message, CloseTicketButton.name);
                                    Logger.warn((err as Error).stack, CloseTicketButton.name);
                                }
                            }, 5000);
                        }
                    }
                });
            }
        } catch (err) {
            Logger.error((err as Error).message, CloseTicketButton.name);
            Logger.warn((err as Error).stack, CloseTicketButton.name);
        }
    }
}