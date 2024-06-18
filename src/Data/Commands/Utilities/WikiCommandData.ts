import { CommandData } from '../../../Structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class WikiCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'wiki',
            description: 'Search for a specific topic on Wikipédia.',
            type: ApplicationCommandType.ChatInput,
            description_localizations: {
                'pt-BR': 'Pesquisa sobre determinado assunto na wikipédia.',
                'en-US': 'Search for a specific topic on Wikipédia.'
            },
            category: {
                'pt-BR': '⚙️ Utilidades',
                'en-US': '⚙️ Utilities'
            },
            aliases: {
                'pt-BR': ['wikipedia', 'wikipédia'],
                'en-US': ['wikipedia', 'wikipédia']
            },
            usage: {
                'pt-BR': ['<pesquisa>'],
                'en-US': ['<search>']
            },
            permissions: {
                client: ['EmbedLinks'],
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
                    name: 'search',
                    description: 'Your search:',
                    type: ApplicationCommandOptionType.String,
                    name_localizations: {
                        'pt-BR': 'pesquisa',
                        'en-US': 'search'
                    },
                    description_localizations: {
                        'pt-BR': 'Sua pesquisa:',
                        'en-US': 'Your search:'
                    },
                    required: true
                }
            ]
        });
    }
}

export const WikiCommandData = new WikiCommandDataConstructor();