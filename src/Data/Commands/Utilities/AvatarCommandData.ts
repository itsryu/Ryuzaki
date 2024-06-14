import { CommandData } from '../../../Structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class AvatarCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'avatar',
            description: 'Shows the avatar of the mentioned user or your own avatar.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'avatar',
                'en-US': 'avatar'
            },
            description_localizations: {
                'pt-BR': 'Exibe o avatar do usuário mencionado ou seu próprio avatar.',
                'en-US': 'Shows the avatar of the mentioned user or your own avatar.'
            },
            category: {
                'pt-BR': '⚙️ Utilidades',
                'en-US': '⚙️ Utilities'
            },
            aliases: {
                'pt-BR': ['av'],
                'en-US': ['av', 'icon']
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
                registerSlash: true,
                args: false
            },
            options: [
                {
                    name: 'user',
                    description: 'Shows the user\'s default avatar:',
                    type: ApplicationCommandOptionType.User,
                    name_localizations: {
                        'pt-BR': 'usuario',
                        'en-US': 'user'
                    },
                    description_localizations: {
                        'pt-BR': 'Exibe o avatar padrão do usuário:',
                        'en-US': 'Shows the user\'s default avatar:'
                    },
                    required: false
                },
                {
                    name: 'guild',
                    description: 'Shows the user\'s avatar on the guild:',
                    type: ApplicationCommandOptionType.String,
                    name_localizations: {
                        'pt-BR': 'servidor',
                        'en-US': 'guild'
                    },
                    description_localizations: {
                        'pt-BR': 'Vê o avatar do usuário no servidor:',
                        'en-US': 'Shows the user\'s avatar on the guild:'
                    },
                    required: false,
                    choices: [
                        {
                            name: 'avatar',
                            value: 'avatar'
                        }
                    ]
                }
            ]
        });
    }
}

export const AvatarCommandData = new AvatarCommandDataConstructor();