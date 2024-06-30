import { CommandData } from '../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class BotInfoCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'bot-info',
            description: 'Displays information about the bot\'s system.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'bot-info',
                'en-US': 'bot-info'
            },
            description_localizations: {
                'pt-BR': 'Exibe informações sobre o sistema do BOT.',
                'en-US': 'Displays information about the bot\'s system.'
            },
            category: {
                'pt-BR': 'Informações',
                'en-US': 'Infos',
                'es-ES': 'Infos'
            },
            aliases: {
                'pt-BR': ['bot', 'botinfo', 'infobot'],
                'en-US': ['bot', 'botinfo', 'infobot'],
                'es-ES': ['bot', 'botinfo', 'infobot']
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
                cooldown: 20,
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

export const BotInfoCommandData = new BotInfoCommandDataConstructor();