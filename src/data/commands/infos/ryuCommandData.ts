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
                'pt-BR': 'Informações',
                'en-US': 'Infos',
                'es-ES': 'Infos'
            },
            aliases: {
                'pt-BR': ['ryuzaki'],
                'en-US': ['ryuzaki'],
                'es-ES': ['ryuzaki']
            },
            usage: {
                'pt-BR': [],
                'en-US': [],
                'es-ES': []
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
                args: false,
                ephemeral: true
            }
        });
    }
}

export const RyuCommandData = new RyuCommandDataConstructor();