import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class InviteCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'invite',
            description: 'Invite me!',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'convite',
                'en-US': 'invite'
            },
            description_localizations: {
                'pt-BR': 'Me convide!',
                'en-US': 'Invite me!'
            },
            category: {
                'pt-BR': 'Utilidades',
                'en-US': 'Utilities',
                'es-ES': 'Utilidades'
            },
            aliases: {
                'pt-BR': ['convite'],
                'en-US': []
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
                isDMAllowed: true,
                registerSlash: true,
                args: false
            }
        });
    }
}

export const InviteCommandData = new InviteCommandDataConstructor();