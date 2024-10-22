import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class DailyCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'daily',
            type: ApplicationCommandType.ChatInput,
            description: 'Command to get your daily reward.',
            name_localizations: {
                'pt-BR': 'diário',
                'en-US': 'daily'
            },
            description_localizations: {
                'pt-BR': 'Comando para pegar sua recompensa diária.',
                'en-US': 'Command to get your daily reward.'
            },
            category: {
                'pt-BR': 'Economia',
                'en-US': 'Economy',
                'es-ES': 'Economía'
            },
            aliases: {
                'pt-BR': ['diário', 'diario'],
                'en-US': [],
                'es-ES': ['diario']
            },
            usage: {
                'pt-BR': [],
                'en-US': [],
                'es-ES': []
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
                args: false,
                ephemeral: true
            }
        });
    }
}

export const DailyCommandData = new DailyCommandDataConstructor();