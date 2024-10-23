import { CommandData } from '../../../structures';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';

class LanguageCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'language',
            type: ApplicationCommandType.ChatInput,
            description:  'Changes Ryuzaki language',
            name_localizations: {
                'pt-BR': 'linguagem',
                'en-US': 'language'
            },
            description_localizations: {
                'pt-BR': 'Altera a linguagem do Ryuzaki',
                'en-US': 'Changes Ryuzaki language'
            },
            category: {
                'pt-BR': 'Configurações',
                'en-US': 'Settings',
                'es-ES': 'Ajustes'
            },
            aliases: {
                'pt-BR': ['idioma', 'idiomas'],
                'en-US': ['languages', 'lang']
            },
            usage: {
                'pt-BR': [],
                'en-US': []
            },
            permissions: {
                client: [],
                member: ['ManageGuild']
            },
            config: {
                cooldown: 20,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: true,
                registerSlash: true,
                args: false,
                ephemeral: false
            },
            options: [
                {
                    name: 'language',
                    description: 'Select the language',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    name_localizations: {
                        'pt-BR': 'linguagem',
                        'en-US': 'language'
                    },
                    description_localizations: {
                        'pt-BR': 'Selecione a linguagem',
                        'en-US': 'Select the language'
                    },
                    choices: [
                        {
                            name: 'Portuguese (Brazilian)',
                            value: 'pt-BR',
                            name_localizations: {
                                'pt-BR': 'Português (Brasil)',
                                'en-US': 'Portuguese (Brazilian)'
                            }
                        },
                        {
                            name: 'English (U.S)',
                            value: 'en-US',
                            name_localizations: {
                                'pt-BR': 'Inglês (U.S)',
                                'en-US': 'English (U.S)'
                            }
                        },
                        {
                            name: 'Spanish (Spain)',
                            value: 'es-ES',
                            name_localizations: {
                                'pt-BR': 'Espanhol (Espanha)',
                                'en-US': 'Spanish (Spain)'
                            }
                        }
                    ]
                }
            ]
        });
    }
}

export const LanguageCommandData = new LanguageCommandDataConstructor();