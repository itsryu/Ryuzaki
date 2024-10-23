import { CommandData } from '../../../structures';
import { ApplicationCommandType } from 'discord.js';

class PingCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'ping',
            description: 'Displays the response ping between user and client and BOT host.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'ping',
                'en-US': 'ping'
            },
            description_localizations: {
                'pt-BR': 'Exibe o ping de resposta entre usuário e cliente e do host do BOT.',
                'en-US': 'Displays the response ping between user and client and BOT host.'
            },
            category: {
                'pt-BR': 'Utilidades',
                'en-US': 'Utilities',
                'es-ES': 'Utilidades'
            },
            aliases: {
                'pt-BR': ['pong'],
                'en-US': ['pong']
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
                args: false,
                ephemeral: true
            }
        });
    }
}

export const PingCommandData = new PingCommandDataConstructor();