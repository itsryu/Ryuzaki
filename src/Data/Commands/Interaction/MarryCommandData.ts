import { CommandData } from '../../../Structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class MarryCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'marry',
            type: ApplicationCommandType.ChatInput,
            description: 'Marry the mentioned user.',
            name_localizations: {
                'pt-BR': 'casar',
                'en-US': 'marry'
            },
            description_localizations: {
                'pt-BR': 'Casa com o usuário mencionado.',
                'en-US': 'Marry the mentioned user.'
            },
            category: {
                'pt-BR': 'Interação',
                'en-US': 'Interaction',
                'es-ES': 'Interacción'
            },
            aliases: {
                'pt-BR': ['casar'],
                'en-US': [],
                'es-ES': ['casarse']
            },
            usage: {
                'pt-BR': ['[usuário]'],
                'en-US': ['[user]'],
                'es-ES': ['[usuario]']
            },
            permissions: {
                client: ['AddReactions', 'ReadMessageHistory'],
                member: []
            },
            config: {
                cooldown: 30,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: false,
                registerSlash: true,
                args: false
            },
            options: [
                {
                    name: 'user',
                    description: 'Select an user:',
                    type: ApplicationCommandOptionType.User,
                    name_localizations: {
                        'pt-BR': 'usuário',
                        'en-US': 'user'
                    },
                    description_localizations: {
                        'pt-BR': 'Selecione um usuário:',
                        'en-US': 'Select an user:'
                    },
                    required: false
                }
            ]
        });
    }
}

export const MarryCommandData = new MarryCommandDataConstructor();