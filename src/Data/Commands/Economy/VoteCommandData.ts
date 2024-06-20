import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class VoteCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'vote',
            type: ApplicationCommandType.ChatInput,
            description: 'Earn a reward by voting me on DBL',
            name_localizations: {
                'pt-BR': 'votar',
                'en-US': 'vote'
            },
            description_localizations: {
                'pt-BR': 'Ganhe uma recompensa votando em mim no DBL',
                'en-US': 'Earn a reward by voting me on DBL'
            },
            category: {
                'pt-BR': 'Economia',
                'en-US': 'Economy',
                'es-ES': 'Economía'
            },
            aliases: {
                'pt-BR': ['dbl', 'upvote', 'votar'],
                'en-US': ['dbl', 'upvote']
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

export const VoteCommandData = new VoteCommandDataConstructor();