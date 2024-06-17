import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class RankMoneyCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'rankmoney',
            type: ApplicationCommandType.ChatInput,
            description: 'Displays currency rank.',
            name_localizations: {
                'pt-BR': 'rankmoney',
                'en-US': 'rankmoney'
            },
            description_localizations: {
                'pt-BR': 'Exibe o rank monetário.',
                'en-US': 'Displays currency rank.'
            },
            category: {
                'pt-BR': '💸 Economia',
                'en-US': '💸 Economy'
            },
            aliases: {
                'pt-BR': ['rankcoin', 'coinrank', 'coinsrank'],
                'en-US': ['rankcoin', 'coinrank', 'coinsrank']
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

export const RankMoneyCommandData = new RankMoneyCommandDataConstructor();