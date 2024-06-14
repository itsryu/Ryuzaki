import { CommandData } from '../../../Structures';
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
                'pt-BR': '🧦 Desenvolvedor',
                'en-US': '🧦 Developer'
            },
            aliases: {
                'pt-BR': ['t', 'teste'],
                'en-US': ['t']
            },
            usage: {
                'pt-BR': ['<null>'],
                'en-US': ['<null>']
            },
            permissions: {
                client: [],
                member: []
            },
            config: {
                cooldown: 10,
                devOnly: true,
                interactionOnly: false,
                registerSlash: false,
                args: false
            }
        });
    }
}

export const TestCommandData = new TestCommandDataConstructor();