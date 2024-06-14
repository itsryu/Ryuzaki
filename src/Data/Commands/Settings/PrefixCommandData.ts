import { CommandData } from '../../../Structures';
import {  ApplicationCommandType } from 'discord.js';

class PrefixCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'prefix',
            description: 'Configure the BOT prefix on the server.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'prefixo',
                'en-US': 'prefix'
            },
            description_localizations: {
                'pt-BR': 'Configura o prefixo do BOT no servidor.',
                'en-US': 'Configure the BOT prefix on the server.'
            },
            category: {
                'pt-BR': '🔧 Configurações',
                'en-US': '🔧 Settings'
            },
            aliases: {
                'pt-BR': ['prefixo'],
                'en-US': []
            },
            usage: {
                'pt-BR': [],
                'en-US': []
            },
            permissions: {
                client: ['ReadMessageHistory'],
                member: ['ManageGuild']
            },
            config: {
                cooldown: 60,
                devOnly: false,
                interactionOnly: false,
                registerSlash: true,
                args: false
            }
        });
    }
}

export const PrefixCommandData = new PrefixCommandDataConstructor();