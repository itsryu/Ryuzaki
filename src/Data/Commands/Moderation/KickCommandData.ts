import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { CommandData } from '../../../Structures';

class KickCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'kick',
            description: 'Kicks the mentioned user from server',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'expulsar',
                'en-US': 'kick'
            },
            description_localizations: {
                'pt-BR': 'Expulsa o usuário mencionado do servidor',
                'en-US': 'Kicks the mentioned user from server'
            },
            category: {
                'pt-BR': 'Moderação',
                'en-US': 'Moderation',
                'es-ES': 'Moderación'
            },
            aliases: {
                'pt-BR': ['expulsar'],
                'en-US': [],
                'es-ES': ['expulsar']
            },
            usage: {
                'pt-BR': ['<user|ID> [motivo]'],
                'en-US': ['<user|ID> [reason]']
            },
            permissions: {
                client: ['KickMembers', 'ReadMessageHistory'],
                member: ['KickMembers']
            },
            config: {
                cooldown: 0,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: false,
                registerSlash: true,
                args: true,
                ephemeral: false
            },
            options: [
                {
                    name: 'user',
                    description: 'Select an user:',
                    type: ApplicationCommandOptionType.User,
                    name_localizations: {
                        'pt-BR': 'usuário',
                        'en-US': 'user'
                    },
                    description_localizations: {
                        'pt-BR': 'Selecione um usuário:',
                        'en-US': 'Select an user:'
                    },
                    required: true
                },
                {
                    name: 'reason',
                    description: 'Write a reason:',
                    type: ApplicationCommandOptionType.String,
                    name_localizations: {
                        'pt-BR': 'motivo',
                        'en-US': 'reason'
                    },
                    description_localizations: {
                        'pt-BR': 'Escreva um motivo:',
                        'en-US': 'Write a reason:'
                    },
                    required: false
                }
            ]
        });
    }
}

export const KickCommandData = new KickCommandDataConstructor();