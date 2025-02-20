import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure, ClientEmbed } from '../../structures';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, OmitPartialGroupDMChannel, codeBlock } from 'discord.js';
import { CalculatorCommandData } from '../../data/commands/utilities/calculatorCommandData';
import { Logger } from '../../utils';

export default class CalculatorCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, CalculatorCommandData);
    }

    public async commandExecute({ message }: { message: OmitPartialGroupDMChannel<Message> }) {
        try {
            return void await message.reply({
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: 'C' }))
                                .setLabel('C')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '<' }))
                                .setLabel('<')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: 'x²' }))
                                .setLabel('x²')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '/' }))
                                .setLabel('/')
                                .setStyle(ButtonStyle.Primary)
                        ]),
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '7' }))
                                .setLabel('7')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '8' }))
                                .setLabel('8')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '9' }))
                                .setLabel('9')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '*' }))
                                .setLabel('*')
                                .setStyle(ButtonStyle.Primary)
                        ]),
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '4' }))
                                .setLabel('4')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '5' }))
                                .setLabel('5')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '6' }))
                                .setLabel('6')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '-' }))
                                .setLabel('-')
                                .setStyle(ButtonStyle.Primary)
                        ]),
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '1' }))
                                .setLabel('1')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '2' }))
                                .setLabel('2')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '3' }))
                                .setLabel('3')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '+' }))
                                .setLabel('+')
                                .setStyle(ButtonStyle.Primary)
                        ]),
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '+/-' }))
                                .setLabel('+/-')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '0' }))
                                .setLabel('0')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '.' }))
                                .setLabel(',')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(JSON.stringify({ c: 'calculator', k: '=' }))
                                .setLabel('=')
                                .setStyle(ButtonStyle.Success)
                        ])
                ],
                embeds: [
                    new ClientEmbed(this.client)
                        .setColor('Random')
                        .setDescription(codeBlock('0'.padStart(30)))
                ]
            });
        } catch (err) {
            Logger.error((err as Error).message, CalculatorCommand.name);
            Logger.warn((err as Error).stack, CalculatorCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}