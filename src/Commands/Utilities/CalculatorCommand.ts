import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, MessageComponentInteraction } from 'discord.js';
import { CalculatorCommandData } from '../../Data/Commands/Utilities/CalculatorCommandData';
import { inspect } from 'util';

export default class CalculatorCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, CalculatorCommandData);
    }

    public async commandExecute({ message }: { message: Message }) {
        try {
            const embed = new ClientEmbed(this.client)
                .setTitle('‎ '.repeat(106))
                .setDescription('```\n‎ \n```');

            const comp = (state: boolean) => [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder({
                        customId: 'x',
                        style: ButtonStyle.Secondary,
                        label: '‎',
                        disabled: true
                    }),
                    new ButtonBuilder({
                        customId: 'z',
                        style: ButtonStyle.Secondary,
                        label: '‎',
                        disabled: true
                    }),
                    new ButtonBuilder({
                        customId: 'back',
                        label: '←',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: 'del',
                        label: 'del',
                        style: ButtonStyle.Danger,
                        disabled: state
                    })
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder({
                        customId: '7',
                        label: '7',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '8',
                        label: '8',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '9',
                        label: '9',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '+',
                        label: '+',
                        style: ButtonStyle.Primary,
                        disabled: state
                    })
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder({
                        customId: '4',
                        label: '4',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '5',
                        label: '5',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '6',
                        label: '6',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '-',
                        label: '-',
                        style: ButtonStyle.Primary,
                        disabled: state
                    })
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder({
                        customId: '1',
                        label: '1',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '2',
                        label: '2',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '3',
                        label: '3',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '*',
                        label: '×',
                        style: ButtonStyle.Primary,
                        disabled: state
                    })
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder({
                        customId: '0',
                        label: '0',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '.',
                        label: '.',
                        style: ButtonStyle.Secondary,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '=',
                        label: '=',
                        style: ButtonStyle.Success,
                        disabled: state
                    }),
                    new ButtonBuilder({
                        customId: '/',
                        label: '÷',
                        style: ButtonStyle.Primary,
                        disabled: state
                    })
                )
            ];

            let string: string | null = null;
            const msg = await message.reply({ embeds: [embed], components: comp(false) });
            const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: `${i.user}, essa interação não é pra você. 👀`, ephemeral: true }), false);
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 2 });

            collector.on('end', async () => {
                embed.setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });
                await msg.edit({ components: comp(true), embeds: [embed] });
            });

            collector.on('collect', async (i) => {
                if (i.customId === '1') {
                    if (string == null) {
                        string = '1';
                    } else {
                        string = string + '1';
                    }
                } else if (i.customId === '2') {
                    if (string == null) {
                        string = '2';
                    } else {
                        string = string + '2';
                    }
                } else if (i.customId === '3') {
                    if (string == null) {
                        string = '3';
                    } else {
                        string = string + '3';
                    }
                } else if (i.customId === '4') {
                    if (string == null) {
                        string = '4';
                    } else {
                        string = string + '4';
                    }
                } else if (i.customId === '5') {
                    if (string == null) {
                        string = '5';
                    } else {
                        string = string + '5';
                    }
                } else if (i.customId === '6') {
                    if (string == null) {
                        string = '6';
                    } else {
                        string = string + '6';
                    }
                } else if (i.customId === '7') {
                    if (string == null) {
                        string = '7';
                    } else {
                        string = string + '7';
                    }
                } else if (i.customId === '8') {
                    if (string == null) {
                        string = '8';
                    } else {
                        string = string + '8';
                    }
                } else if (i.customId === '9') {
                    if (string == null) {
                        string = '9';
                    } else {
                        string = string + '9';
                    }
                } else if (i.customId === '0') {
                    if (string == null) {
                        string = '0';
                    } else {
                        string = string + '0';
                    }
                } else if (i.customId === '+') {
                    if (string == null) {
                        string = ' + ';
                    } else {
                        string = string + ' + ';
                    }
                } else if (i.customId === '-') {
                    if (string == null) {
                        string = ' - ';
                    } else {
                        string = string + ' - ';
                    }
                } else if (i.customId === '*') {
                    if (string == null) {
                        string = ' * ';
                    } else {
                        string = string + ' * ';
                    }
                } else if (i.customId === '/') {
                    if (string == null) {
                        string = ' / ';
                    } else {
                        string = string + ' / ';
                    }
                } else if (i.customId === '.') {
                    if (string == null) {
                        string = '.';
                    } else {
                        string = string + '.';
                    }
                } else if (i.customId === 'del') {
                    string = null;
                    return msg.edit({ embeds: [embed.setDescription('```\n‎ \n```')] });
                } else if (i.customId === 'back') {
                    if (string) {
                        if (string.endsWith(' ')) {
                            string = string.slice(0, -3);
                        } else {
                            string = string.slice(0, -1);
                        }
                    }
                } else if (i.customId === '=') {
                    if (string) {
                        try {
                            const result = await Promise.any([eval(string), Promise.reject(null)]);
                            let output = result;

                            if (typeof result === 'string') {
                                output = inspect(result);
                            }

                            string = `${string.toString()} = ${output}`;
                        } catch (e) {
                            string = 'Insira um valor válido!';
                        }
                    }
                }

                embed.setDescription('\`\`\`\n' + string + '\n\`\`\`');
                await msg.edit({ embeds: [embed] });
            });
        } catch (err) {
            this.client.logger.error((err as Error).message, CalculatorCommand.name);
            this.client.logger.warn((err as Error).stack, CalculatorCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}