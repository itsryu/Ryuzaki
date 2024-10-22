import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class CalculatorCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'calculator',
            description: 'Displays a calculator.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'calculadora',
                'en-US': 'calculator'
            },
            description_localizations: {
                'pt-BR': 'Exibe uma calculadora.',
                'en-US': 'Displays a calculator.'
            },
            category: {
                'pt-BR': 'Utilidades',
                'en-US': 'Utilities',
                'es-ES': 'Utilidades'
            },
            aliases: {
                'pt-BR': ['calc', 'calculadora', 'calcular'],
                'en-US': ['calc', 'calculator', 'calculate']
            },
            usage: {
                'pt-BR': [],
                'en-US': []
            },
            permissions: {
                client: ['EmbedLinks'],
                member: []
            },
            config: {
                cooldown: 60 * 2,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: true,
                registerSlash: true,
                args: false,
                ephemeral: true
            }
        });
    }
}

export const CalculatorCommandData = new CalculatorCommandDataConstructor();