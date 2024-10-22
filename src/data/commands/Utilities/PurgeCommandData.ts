import { CommandData } from '../../../Structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class PurgeCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'purge',
            description: 'Purges [1-100] messages from the user where the command was executed.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'purgar',
                'en-US': 'purge'
            },
            description_localizations: {
                'pt-BR': 'Purga [1-100] mensagens do usuário onde o comando foi executado.',
                'en-US': 'Purges [1-100] messages from the user where the command was executed.'
            },
            category: {
                'pt-BR': 'Moderação',
                'en-US': 'Moderation',
                'es-ES': 'Moderación'
            },
            aliases: {
                'pt-BR': [],
                'en-US': []
            },
            usage: {
                'pt-BR': ['<número>'],
                'en-US': ['<number>']
            },
            permissions: {
                client: ['ManageMessages', 'ReadMessageHistory'],
                member: []
            },
            config: {
                cooldown: 10,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: false,
                registerSlash: true,
                args: true,
                ephemeral: true
            },
            options: [
                {
                    name: 'amount',
                    description: 'Enter the amount:',
                    type: ApplicationCommandOptionType.Integer,
                    name_localizations: {
                        'pt-BR': 'quantidade',
                        'en-US': 'amount'
                    },
                    description_localizations: {
                        'pt-BR': 'Insira a quantidade:',
                        'en-US': 'Enter the amount:'
                    },
                    required: true
                }
            ]
        });
    }
}

export const PurgeCommandData = new PurgeCommandDataConstructor();