import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class WorkCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'work',
            type: ApplicationCommandType.ChatInput,
            description: 'Command to work and get your money and experience.',
            name_localizations: {
                'pt-BR': 'diário',
                'en-US': 'daily'
            },
            description_localizations: {
                'pt-BR': 'Comando para trabalhar e ganhar o seu dinheiro e experiência.',
                'en-US': 'Command to work and get your money and experience.'
            },
            category: {
                'pt-BR': '💸 Economia',
                'en-US': '💸 Economy'
            },
            aliases: {
                'pt-BR': ['trabalhar', 'trabalho'],
                'en-US': []
            },
            usage: {
                'pt-BR': [],
                'en-US': []
            },
            permissions: {
                client: [],
                member: []
            },
            config: {
                cooldown: 10,
                devOnly: false,
                interactionOnly: false,
                registerSlash: true,
                args: false
            }
        });
    }
}

export const WorkCommandData = new WorkCommandDataConstructor();