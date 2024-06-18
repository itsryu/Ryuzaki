import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class LogsCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'logs',
            type: ApplicationCommandType.ChatInput,
            description: 'Configures the server\'s log channel.',
            description_localizations: {
                'pt-BR': 'Configura o canal de logs do servidor.',
                'en-US': 'Configures the guild\'s log channel.'
            },
            category: {
                'pt-BR': '🔧 Configurações',
                'en-US': '🔧 Settings'
            },
            aliases: {
                'pt-BR': ['log'],
                'en-US': ['log']
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
                cooldown: 60,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: false,
                registerSlash: true,
                args: false
            }
        });
    }
}

export const LogsCommandData = new LogsCommandDataConstructor();