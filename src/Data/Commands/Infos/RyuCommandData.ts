import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class RyuCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'ryu',
            description: 'Informations about me.',
            type: ApplicationCommandType.ChatInput,
            description_localizations: {
                'pt-BR': 'Informações sobre mim.',
                'en-US': 'Informations about me.'
            },
            category: {
                'pt-BR': '❔ Infos',
                'en-US': '❔ Infos'
            },
            aliases: {
                'pt-BR': ['ryuzaki'],
                'en-US': ['ryuzaki']
            },
            usage: {
                'pt-BR': [],
                'en-US': []
            },
            permissions: {
                client: ['EmbedLinks'],
                member: []
            },
            config: {
                cooldown: 10,
                devOnly: false,
                interactionOnly: false,
                registerSlash: true,
                args: false
            }
        });
    }
}

export const RyuCommandData = new RyuCommandDataConstructor();