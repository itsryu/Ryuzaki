import { CommandData } from '../../../structures';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';

class BagCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'bag',
            type: ApplicationCommandType.ChatInput,
            description: 'Displays the amount of money of the mentioned user or yours.',
            name_localizations: {
                'pt-BR': 'carteira',
                'en-US': 'bag'
            },
            description_localizations: {
                'pt-BR': 'Exibe a quantidade de dinheiro do usuário mencionado ou a sua.',
                'en-US': 'Displays the amount of money of the mentioned user or yours.'
            },
            category: {
                'pt-BR': 'Economia',
                'en-US': 'Economy',
                'es-ES': 'Economía'
            },
            aliases: {
                'pt-BR': ['carteira'],
                'en-US': ['balance', 'wallet'],
                'es-ES': ['balance', 'cartera']
            },
            usage: {
                'pt-BR': ['[usuário]'],
                'en-US': ['[user]'],
                'es-ES': ['[usuario]']
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
            },
            options: [
                {
                    name: 'user',
                    description: 'Shows user\'s bag:',
                    type: ApplicationCommandOptionType.User,
                    name_localizations: {
                        'pt-BR': 'usuário',
                        'en-US': 'user'
                    },
                    description_localizations: {
                        'pt-BR': 'Exibe a carteira do usuário:',
                        'en-US': 'Shows user\'s bag:'
                    },
                    required: false
                }
            ]
        });
    }
}

export const BagCommandData = new BagCommandDataConstructor();