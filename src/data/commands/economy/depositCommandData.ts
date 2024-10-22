import { CommandData } from '../../../Structures';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';

class DepositCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'deposit',
            type: ApplicationCommandType.ChatInput,
            description: 'Displays the amount of money of the mentioned user or yours.',
            name_localizations: {
                'pt-BR': 'depositar',
                'en-US': 'deposit'
            },
            description_localizations: {
                'pt-BR': 'Deposite o seu dinheiro no banco.',
                'en-US': 'Deposit your money in the bank.'
            },
            category: {
                'pt-BR': 'Economia',
                'en-US': 'Economy',
                'es-ES': 'Economía'
            },
            aliases: {
                'pt-BR': ['dep', 'depositar'],
                'en-US': ['dep'],
                'es-ES': ['dep']
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
                args: true,
                ephemeral: true
            },
            options: [
                {
                    name: 'amount',
                    description: 'The amount you want to deposit:',
                    type: ApplicationCommandOptionType.String,
                    name_localizations: {
                        'pt-BR': 'quantia',
                        'en-US': 'amount'
                    },
                    description_localizations: {
                        'pt-BR': 'A quantia que você deseja depositar:',
                        'en-US': 'The amount you want to deposit:'
                    },
                    required: true
                }
            ]
        });
    }
}

export const DepositCommandData = new DepositCommandDataConstructor();