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
                'pt-BR': '💸 Economia',
                'en-US': '💸 Economy'
            },
            aliases: {
                'pt-BR': ['diário', 'diario'],
                'en-US': []
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
                registerSlash: true,
                args: false
            }
        });
    }
}

export const DailyCommandData = new DailyCommandDataConstructor();