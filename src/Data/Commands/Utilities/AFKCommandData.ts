import { CommandData } from '../../../Structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class AFKCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'afk',
            description:  'Sets user as AFK.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'afk',
                'en-US': 'afk'
            },
            description_localizations: {
                'pt-BR': 'Define o usuário como afk.',
                'en-US': 'Sets user as AFK.'
            },
            category: {
                'pt-BR': '⚙️ Utilidades',
                'en-US': '⚙️ Utilities'
            },
            aliases: {
                'pt-BR': [],
                'en-US': ['awayfromkeyboard, awayfromthekeyboard']
            },
            usage: {
                'pt-BR': ['[texto]'],
                'en-US': ['[text]']
            },
            permissions: {
                client: ['ManageNicknames'],
                member: []
            },
            config: {
                cooldown: 10,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: true,
                registerSlash: true,
                args: false
            },
            options: [
                {
                    name: 'reason',
                    description: 'Describe a reason:',
                    type: ApplicationCommandOptionType.String,
                    name_localizations: {
                        'pt-BR': 'motivo',
                        'en-US': 'reason'
                    },
                    description_localizations: {
                        'pt-BR': 'Descreva um motivo:',
                        'en-US': 'Describe a reason:'
                    },
                    required: false
                }
            ]
        });
    }
}

export const AFKCommandData = new AFKCommandDataConstructor();