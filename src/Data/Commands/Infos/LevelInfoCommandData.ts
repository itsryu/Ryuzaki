import { CommandData } from '../../../Structures';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';

class LevelInfoCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'level-info',
            description: 'Displays information about user level.',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'level-info',
                'en-US': 'level-info'
            },
            description_localizations: {
                'pt-BR': 'Exibe informações sobre o nível do usuário.',
                'en-US': 'Displays information about user level.'
            },
            category: {
                'pt-BR': 'Informações',
                'en-US': 'Infos',
                'es-ES': 'Infos'
            },
            aliases: {
                'pt-BR': ['level', 'levelinfo', 'infolevel', 'info-level', 'nivel', 'nivelinfo', 'infonivel', 'info-nivel'],
                'en-US': ['level', 'levelinfo', 'infolevel', 'info-level'],
                'es-ES': ['level', 'levelinfo', 'infolevel', 'info-level']
            },
            usage: {
                'pt-BR': ['[usuário]'],
                'en-US': ['[user]'],
                'es-ES': ['[usuario]']
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
                args: false
            },
            options: [
                {
                    name: 'user',
                    description: 'Shows the user\'s level info:',
                    type: ApplicationCommandOptionType.User,
                    name_localizations: {
                        'pt-BR': 'usuário',
                        'en-US': 'user'
                    },
                    description_localizations: {
                        'pt-BR': 'Mostra as informações de nível do usuário:',
                        'en-US': 'Shows the user\'s level info:'
                    },
                    required: false
                }
            ]
        });
    }
}

export const LevelInfoCommandData = new LevelInfoCommandDataConstructor();