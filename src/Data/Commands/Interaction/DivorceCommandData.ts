import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class DivorceCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'divorce',
            description: 'Divorce from your soul mate',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'divorciar',
                'en-US': 'divorce'
            },
            description_localizations: {
                'pt-BR': 'Divorcia da sua alma gêmea',
                'en-US': 'Divorce from your soul mate'
            },
            category: {
                'pt-BR': 'Interação',
                'en-US': 'Interaction',
                'es-ES': 'Interacción'
            },
            aliases: {
                'pt-BR': ['divórcio', 'divorcio'],
                'en-US': [],
                'es-ES': ['divorcio']
            },
            usage: {
                'pt-BR': [],
                'en-US': [],
                'es-ES': []
            },
            permissions: {
                client: ['AddReactions', 'ReadMessageHistory'],
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

export const DivorceCommandData = new DivorceCommandDataConstructor();