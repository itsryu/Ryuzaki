import { CommandData } from '../../../structures';
import { ApplicationCommandType } from 'discord.js';

class TestCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'test',
            type: ApplicationCommandType.ChatInput,
            description: 'null',
            name_localizations: {
                'pt-BR': 'null',
                'en-US': 'null'
            },
            description_localizations: {
                'pt-BR': 'null',
                'en-US': 'null'
            },
            category: {
                'pt-BR': 'Desenvolvedor',
                'en-US': 'Developer',
                'es-ES': 'Desarrollador'
            },
            aliases: {
                'pt-BR': ['t', 'teste'],
                'en-US': ['t'],
                'es-ES': ['t']
            },
            usage: {
                'pt-BR': ['<null>'],
                'en-US': ['<null>'],
                'es-ES': ['<null>']
            },
            permissions: {
                client: [],
                member: []
            },
            config: {
                cooldown: 0,
                devOnly: true,
                interactionOnly: false,
                isDMAllowed: true,
                registerSlash: false,
                args: false
            }
        });
    }
}

export const TestCommandData = new TestCommandDataConstructor();