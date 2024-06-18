import { CommandData } from '../../../Structures';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';

class HelpCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'help',
            description: 'Opens a help menu with some BOT commands.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'ajuda',
                'en-US': 'help'
            },
            description_localizations: {
                'pt-BR': 'Abre um menu de ajuda com alguns comandos do BOT.',
                'en-US': 'Opens a help menu with some BOT commands.'
            },
            category: {
                'pt-BR': '❔ Infos',
                'en-US': '❔ Infos'
            },
            aliases: {
                'pt-BR': ['ajuda', 'comandos', 'comando'],
                'en-US': ['commands']
            },
            usage: {
                'pt-BR': ['[comando]'],
                'en-US': ['[command]']
            },
            permissions: {
                client: ['ReadMessageHistory', 'SendMessages'],
                member: []
            },
            config: {
                cooldown: 10,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: true,
                registerSlash: true,
                args: false
            },
            options: [
                {
                    name: 'command',
                    description: 'Select a command:',
                    type: ApplicationCommandOptionType.String,
                    name_localizations: {
                        'pt-BR': 'comando',
                        'en-US': 'command'
                    },
                    description_localizations: {
                        'pt-BR': 'Selecione um comando',
                        'en-US': 'Select a command:'
                    },
                    required: false
                }
            ]
        });
    }
}

export const HelpCommandData = new HelpCommandDataConstructor();