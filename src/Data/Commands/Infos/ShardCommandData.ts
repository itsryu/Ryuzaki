import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class ShardCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'shard',
            type: ApplicationCommandType.ChatInput,
            description: 'Displays information about the shards.',
            description_localizations: {
                'pt-BR': 'Exibe informações sobre as shards.',
                'en-US': 'Displays information about the shards.'
            },
            category: {
                'pt-BR': 'Informações',
                'en-US': 'Infos',
                'es-ES': 'Infos'
            },
            aliases: {
                'pt-BR': ['shards'],
                'en-US': ['shards']
            },
            usage: {
                'pt-BR': [],
                'en-US': []
            },
            permissions: {
                client: [],
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

export const ShardCommandData = new ShardCommandDataConstructor();