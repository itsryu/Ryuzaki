import { Ryuzaki } from '../../RyuzakiClient';
import { ModuleStructure } from '../../Structures';
import { ActionRowBuilder, ButtonBuilder, ChannelType, ButtonInteraction, ButtonStyle, TextChannel, MessageComponentInteraction } from 'discord.js';
import { writeFileSync, readdirSync, statSync } from 'node:fs';
import { Languages } from '../../Types/ClientTypes';

export default class CloseTicketButton extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

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
                    return `[${this.client.utils.getTime(m.createdTimestamp, language)}] ` + `${m.author.tag}: ` + m.content;
                }).reverse().join('\n');

                writeFileSync(`./src/Logs/log-${interaction.user.id}.txt`, log);

                const logFile = readdirSync('./src/Logs').filter((file) => file === `log-${interaction.user.id}.txt`).toString();
                const pathFile = `./src/Logs/${logFile}`;
                const size = statSync(pathFile).size;

                collector.on('collect', (i) => {
                    if (i.customId == 'save') {
                        if (size > 0) {
                            interaction.user.send({ content: 'Aqui está o `log do ticket`:', files: [pathFile] })
                                .then(() => {
                                    if (interaction.channel?.type === ChannelType.DM) return;
                                    return interaction.followUp('O arquivo foi enviado em seu privado! 📑');
                                })
                                .catch(() => {
                                    return interaction.followUp({ content: 'Não pude enviar o arquivo em sua DM, então aqui esta ele:', files: [pathFile] });
                                });

                            if (guildData && guildData.logs.status && guildData.logs.moderation) {
                                const channel = interaction.guild?.channels.cache.get(guildData.logs.channel) as TextChannel;
                                channel.send({ files: [pathFile] }).catch(() => undefined);
                            }

                            interaction.followUp('Irei `fechar o ticket e deletar o canal` daqui `15 segundos`.');

                            setTimeout(async () => {
                                try {
                                    userData?.set({
                                        'ticket.have': false,
                                        'ticket.channel': null
                                    });
                                    await userData?.save();

                                    await interaction.channel?.delete();
                                } catch (err) {
                                    this.client.logger.error((err as Error).message, CloseTicketButton.name);
                                    this.client.logger.warn((err as Error).stack!, CloseTicketButton.name);
                                }
                            }, 15000);
                        } else {
                            interaction.followUp('O seu ticket não apresenta conversas. Irei `fechar o ticket e deletar` o canal daqui `5 segundos`.');

                            setTimeout(async () => {
                                try {
                                    userData?.set({
                                        'ticket.have': false,
                                        'ticket.channel': null
                                    });
                                    await userData?.save();

                                    await interaction.channel?.delete();
                                } catch (err) {
                                    console.error(err); return;
                                }
                            }, 5000);
                        }
                    }

                    if (i.customId == 'not_save') {
                        if (size > 0) {
                            if (guildData && guildData.logs.status && guildData.logs.moderation) {
                                const channel = interaction.guild?.channels.cache.get(guildData.logs.channel) as TextChannel;
                                channel.send({ files: [pathFile] }).catch(() => undefined);
                            }

                            interaction.followUp('Irei `fechar o ticket e deletar` o canal daqui `5 segundos`.');

                            setTimeout(async () => {
                                try {
                                    userData?.set({
                                        'ticket.have': false,
                                        'ticket.channel': null
                                    });
                                    await userData?.save();

                                    await interaction.channel?.delete();
                                } catch (err) {
                                    this.client.logger.error((err as Error).message, CloseTicketButton.name);
                                    this.client.logger.warn((err as Error).stack!, CloseTicketButton.name);
                                }
                            }, 5000);
                        } else {
                            interaction.followUp('Irei `fechar o ticket e deletar` o canal daqui `5 segundos`.');

                            setTimeout(async () => {
                                try {
                                    userData?.set({
                                        'ticket.have': false,
                                        'ticket.channel': null
                                    });
                                    await userData?.save();

                                    await interaction.channel?.delete();
                                } catch (err) {
                                    console.error(err); return;
                                }
                            }, 5000);
                        }
                    }
                });
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, CloseTicketButton.name);
            this.client.logger.warn((err as Error).stack!, CloseTicketButton.name);
        }
    }
}