import { CommandData } from '../../../Structures';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';

class WithdrawCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'withdraw',
            type: ApplicationCommandType.ChatInput,
            description: 'Withdraw your money from the bank.',
            name_localizations: {
                'pt-BR': 'sacar',
                'en-US': 'withdraw'
            },
            description_localizations: {
                'pt-BR': 'Saque o seu dinheiro do banco.',
                'en-US': 'Withdraw your money from the bank.'
            },
            category: {
                'pt-BR': 'Economia',
                'en-US': 'Economy',
                'es-ES': 'Economía'
            },
            aliases: {
                'pt-BR': ['retirar', 'sacar'],
                'en-US': [],
                'es-ES': ['retirar', 'sacar']
            },
            usage: {
                'pt-BR': ['<quantia|tudo>'],
                'en-US': ['<amount|all>'],
                'es-ES': ['<cantidad|todo>']
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
                args: true
            },
            options: [
                {
                    name: 'amount',
                    description: 'The amount you want to withdraw:',
                    type: ApplicationCommandOptionType.String,
                    name_localizations: {
                        'pt-BR': 'quantia',
                        'en-US': 'amount'
                    },
                    description_localizations: {
                        'pt-BR': 'A quantia que você deseja sacar:',
                        'en-US': 'The amount you want to withdraw:'
                    },
                    required: true
                }
            ]
        });
    }
}

export const WithdrawCommandData = new WithdrawCommandDataConstructor();