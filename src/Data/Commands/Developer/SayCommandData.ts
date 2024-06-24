import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class SayCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'say',
            type: ApplicationCommandType.ChatInput,
            description: 'Make Ryuzaki say something.',
            name_localizations: {
                'pt-BR': 'falar',
                'en-US': 'say'
            },
            description_localizations: {
                'pt-BR': 'Faz o Ryuzaki dizer algo.',
                'en-US': 'Make Ryuzaki say something.'
            },
            category: {
                'pt-BR': 'Desenvolvedor',
                'en-US': 'Developer',
                'es-ES': 'Desarrollador'
            },
            aliases: {
                'pt-BR': ['falar', 'dizer'],
                'en-US': []
            },
            usage: {
                'pt-BR': ['<mensagem>'],
                'en-US': ['<message>']
            },
            permissions: {
                client: [],
                member: []
            },
            config: {
                cooldown: 0,
                devOnly: true,
                interactionOnly: false,
                isDMAllowed: false,
                registerSlash: false,
                args: true
            }
        });
    }
}

export const SayCommandData = new SayCommandDataConstructor();