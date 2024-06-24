import { CommandData } from '../../../Structures';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';

class StealCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'steal',
            type: ApplicationCommandType.ChatInput,
            description: 'Steals money from a specific user.',
            name_localizations: {
                'pt-BR': 'roubar',
                'en-US': 'steal'
            },
            description_localizations: {
                'pt-BR': 'Rouba dinheiro de um usuário específico.',
                'en-US': 'Steals money from a specific user.'
            },
            category: {
                'pt-BR': 'Economia',
                'en-US': 'Economy',
                'es-ES': 'Economía'
            },
            aliases: {
                'pt-BR': ['roubar', 'assaltar', 'furtar'],
                'en-US': ['steal', 'rob']
            },
            usage: {
                'pt-BR': ['<usuário>'],
                'en-US': ['<user>']
            },
            permissions: {
                client: ['EmbedLinks'],
                member: []
            },
            config: {
                cooldown: 10,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: false,
                registerSlash: true,
                args: true
            },
            options: [
                {
                    name: 'user',
                    description: 'The user you want to steal the money:',
                    type: ApplicationCommandOptionType.User,
                    name_localizations: {
                        'pt-BR': 'usuário',
                        'en-US': 'user'
                    },
                    description_localizations: {
                        'pt-BR': 'O usuário que você deseja roubar o dinheiro:',
                        'en-US': 'The user you want to steal the money:'
                    },
                    required: true
                }
            ]
        });
    }
}

export const StealCommandData = new StealCommandDataConstructor();