import { CommandData } from '../../../Structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class ClearCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'clear',
            description: 'Clears [1-100] messages from the channel where command was executed.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'limpar',
                'en-US': 'clear'
            },
            description_localizations: {
                'pt-BR': 'Limpa [1-100] mensagens do canal que o comando foi executado.',
                'en-US': 'Clears [1-100] messages from the channel where command was executed.'
            },
            category: {
                'pt-BR': '🛠️ Moderação',
                'en-US': '🛠️ Moderation'
            },
            aliases: {
                'pt-BR': ['deletar', 'limpar'],
                'en-US': ['delete', 'clean']
            },
            usage: {
                'pt-BR': ['<número>'],
                'en-US': ['<number>']
            },
            permissions: {
                client: ['ManageMessages', 'ReadMessageHistory'],
                member: ['ManageMessages']
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
                },
                {
                    name: 'filter',
                    description: 'Enter a filter:',
                    type: ApplicationCommandOptionType.String,
                    name_localizations: {
                        'pt-BR': 'filtro',
                        'en-US': 'filter'
                    },
                    description_localizations: {
                        'pt-BR': 'Insira um filtro:',
                        'en-US': 'Enter a filter'
                    },
                    required: false,
                    choices: [
                        {
                            name: 'bots',
                            name_localizations: {
                                'pt-BR': 'robôs',
                                'en-US': 'bots'
                            },
                            value: 'bots'
                        },
                        {
                            name: 'pinneds',
                            name_localizations: {
                                'pt-BR': 'fixados',
                                'en-US': 'pinneds'
                            },
                            value: 'pinned'
                        },
                        {
                            name: 'image',
                            name_localizations: {
                                'pt-BR': 'imagem',
                                'en-US': 'image'
                            },
                            value: 'image'
                        }
                    ]
                }
            ]
        });
    }
}

export const ClearCommandData = new ClearCommandDataConstructor();