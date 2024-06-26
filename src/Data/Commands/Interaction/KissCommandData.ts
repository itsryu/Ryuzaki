import { CommandData } from '../../../Structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class KissCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'kiss',
            type: ApplicationCommandType.ChatInput,
            description: 'Kiss the mentioned user.',
            name_localizations: {
                'pt-BR': 'beijar',
                'en-US': 'kiss'
            },
            description_localizations: {
                'pt-BR': 'Beija o usuário mencionado.',
                'en-US': 'Kiss the mentioned user.'
            },
            category: {
                'pt-BR': 'Interação',
                'en-US': 'Interaction',
                'es-ES': 'Interacción'
            },
            aliases: {
                'pt-BR': ['beijo', 'beijar'],
                'en-US': [],
                'es-ES': ['beso', 'besar']
            },
            usage: {
                'pt-BR': ['<usuário>'],
                'en-US': ['<user>'],
                'es-ES': ['<usuario>']
            },
            permissions: {
                client: ['AddReactions', 'ReadMessageHistory', 'EmbedLinks'],
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
                    required: true
                }
            ]
        });
    }
}

export const KissCommandData = new KissCommandDataConstructor();