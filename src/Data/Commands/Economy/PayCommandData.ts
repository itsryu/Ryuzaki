import { CommandData } from '../../../Structures';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';

class PayCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'pay',
            type: ApplicationCommandType.ChatInput,
            description: 'Send your money to a specific user.',
            name_localizations: {
                'pt-BR': 'pagar',
                'en-US': 'pay'
            },
            description_localizations: {
                'pt-BR': 'Envie o seu dinheiro para determinado usuário.',
                'en-US': 'Send your money to a specific user.'
            },
            category: {
                'pt-BR': 'Economia',
                'en-US': 'Economy',
                'es-ES': 'Economía'
            },
            aliases: {
                'pt-BR': ['pagar', 'enviar', 'dar'],
                'en-US': ['send', 'give']
            },
            usage: {
                'pt-BR': ['<usuário> <quantia>'],
                'en-US': ['<user> <amount>']
            },
            permissions: {
                client: ['AddReactions', 'ReadMessageHistory'],
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
                    name: 'amount',
                    description: 'The amount you want to send:',
                    type: ApplicationCommandOptionType.Number,
                    name_localizations: {
                        'pt-BR': 'quantia',
                        'en-US': 'amount'
                    },
                    description_localizations: {
                        'pt-BR': 'A quantia que você deseja enviar:',
                        'en-US': 'The amount you want to send:'
                    },
                    required: true
                },
                {
                    name: 'user',
                    description: 'The user you want to send the money to:',
                    type: ApplicationCommandOptionType.User,
                    name_localizations: {
                        'pt-BR': 'usuário',
                        'en-US': 'user'
                    },
                    description_localizations: {
                        'pt-BR': 'O usuário que você deseja enviar o dinheiro:',
                        'en-US': 'The user you want to send the money to:'
                    },
                    required: true
                }
            ]
        });
    }
}

export const PayCommandData = new PayCommandDataConstructor();