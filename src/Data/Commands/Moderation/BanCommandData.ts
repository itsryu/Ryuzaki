import { CommandData } from '../../../Structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class BanCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'ban',
            description: 'Bans the mentioned user',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'banir',
                'en-US': 'ban'
            },
            description_localizations: {
                'pt-BR': 'Bane o usuário mencionado',
                'en-US': 'Bans the mentioned user'
            },
            category: {
                'pt-BR': '🛠️ Moderação',
                'en-US': '🛠️ Moderation'
            },
            aliases: {
                'pt-BR': ['banir'],
                'en-US': ['banishment']
            },
            usage: {
                'pt-BR': ['<user|ID> [motivo]'],
                'en-US': ['<user|ID> [reason]']
            },
            permissions: {
                client: ['BanMembers', 'ReadMessageHistory'],
                member: ['BanMembers']
            },
            config: {
                cooldown: 0,
                devOnly: false,
                interactionOnly: false,
                registerSlash: true,
                args: true
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

export const BanCommandData = new BanCommandDataConstructor();