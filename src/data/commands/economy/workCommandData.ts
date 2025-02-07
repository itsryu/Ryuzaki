import { CommandData } from '../../../structures';
import { ApplicationCommandType } from 'discord.js';

class WorkCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'work',
            type: ApplicationCommandType.ChatInput,
            description: 'Command to work and get your money and experience.',
            name_localizations: {
                'pt-BR': 'trabalho',
                'en-US': 'work'
            },
            description_localizations: {
                'pt-BR': 'Comando para trabalhar e ganhar o seu dinheiro e experiência.',
                'en-US': 'Command to work and get your money and experience.'
            },
            category: {
                'pt-BR': 'Economia',
                'en-US': 'Economy',
                'es-ES': 'Economía'
            },
            aliases: {
                'pt-BR': ['trabalhar', 'trabalho'],
                'en-US': [],
                'es-ES': ['trabajar', 'trabajo']
            },
            usage: {
                'pt-BR': [],
                'en-US': [],
                'es-ES': []
            },
            permissions: {
                client: [],
                member: []
            },
            config: {
                cooldown: 10,
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

export const WorkCommandData = new WorkCommandDataConstructor();