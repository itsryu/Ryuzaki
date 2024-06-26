import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class CatsCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'cats',
            description:'Random cat pictures or gifs.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'gatos',
                'en-US': 'cats'
            },
            description_localizations: {
                'pt-BR': 'Imagens ou gifs aleatórias de gatos.',
                'en-US': 'Random cat pictures or gifs.'
            },
            category: {
                'pt-BR': 'Diversão',
                'en-US': 'Fun',
                'es-ES': 'Diversión'
            },
            aliases: {
                'pt-BR': ['gato', 'gatos'],
                'en-US': ['cat'],
                'es-ES': ['gato', 'gatos']
            },
            usage: {
                'pt-BR': [],
                'en-US': [],
                'es-ES': []
            },
            permissions: {
                client: ['AttachFiles', 'EmbedLinks'],
                member: []
            },
            config: {
                cooldown: 5,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: true,
                registerSlash: true,
                args: false
            }
        });
    }
}

export const CatsCommandData = new CatsCommandDataConstructor();