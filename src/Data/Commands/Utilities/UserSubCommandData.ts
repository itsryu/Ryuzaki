import { CommandData } from '../../../Structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class UserSubCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'user',
            description: 'General user commands',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'usuário',
                'en-US': 'user'
            },
            description_localizations: {
                'pt-BR': 'Comandos gerais de usuário',
                'en-US': 'General user commands'
            },
            category: {
                'pt-BR': '⚙️ Utilidades',
                'en-US': '⚙️ Utilities'
            },
            aliases: {
                'pt-BR': ['usuário', 'usuario', 'usuários'],
                'en-US': ['users']
            },
            usage: {
                'pt-BR': ['image banner|avatar user|guild [usuário]', 'info [usuário]'],
                'en-US': ['image banner|avatar user|guild [user]', 'info [user]']
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
                args: true
            },
            options: [
                {
                    name: 'image',
                    description: 'Displays user avatar or banner',
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    name_localizations: {
                        'pt-BR': 'imagem',
                        'en-US': 'image'
                    },
                    description_localizations: {
                        'pt-BR': 'Exibe o avatar ou banner do usuário',
                        'en-US': 'Displays user avatar or banner'
                    },
                    options: [
                        {
                            name: 'avatar',
                            description: 'Display the user avatar',
                            type: ApplicationCommandOptionType.Subcommand,
                            description_localizations: {
                                'pt-BR': 'Exibe o ícone do servidor',
                                'en-US': 'Display the server icon'
                            },
                            required: false,
                            options: [
                                {
                                    name: 'user',
                                    description: 'Shows the user\'s default avatar:',
                                    type: ApplicationCommandOptionType.User,
                                    name_localizations: {
                                        'pt-BR': 'usuário',
                                        'en-US': 'user'
                                    },
                                    description_localizations: {
                                        'pt-BR': 'Exibe o avatar padrão do usuário:',
                                        'en-US': 'Shows the user\'s default avatar:'
                                    },
                                    required: false
                                },
                                {
                                    name: 'guild',
                                    description: 'Shows the user\'s avatar on the guild:',
                                    type: ApplicationCommandOptionType.User,
                                    name_localizations: {
                                        'pt-BR': 'servidor',
                                        'en-US': 'guild'
                                    },
                                    description_localizations: {
                                        'pt-BR': 'Exibe o avatar do usuário no servidor:',
                                        'en-US': 'Shows the user\'s avatar on the guild:'
                                    },
                                    required: false
                                }
                            ]
                        },
                        {
                            name: 'banner',
                            description: 'Displays the server banner',
                            type: ApplicationCommandOptionType.Subcommand,
                            description_localizations: {
                                'pt-BR': 'Exibe o banner do servidor',
                                'en-US': 'Displays the server banner'
                            },
                            required: false,
                            options: [
                                {
                                    name: 'user',
                                    description: 'Shows the user\'s default banner:',
                                    type: ApplicationCommandOptionType.User,
                                    name_localizations: {
                                        'pt-BR': 'usuário',
                                        'en-US': 'user'
                                    },
                                    description_localizations: {
                                        'pt-BR': 'Exibe o banner padrão do usuário:',
                                        'en-US': 'Shows the user\'s default banner:'
                                    },
                                    required: false
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'info',
                    description: 'Displays user informations',
                    type: ApplicationCommandOptionType.Subcommand,
                    description_localizations: {
                        'pt-BR': 'Exibe informações do usuário',
                        'en-US': 'Displays user informations'
                    },
                    options: [
                        {
                            name: 'user',
                            description: 'Shows the user\'s informations:',
                            type: ApplicationCommandOptionType.User,
                            name_localizations: {
                                'pt-BR': 'usuário',
                                'en-US': 'user'
                            },
                            description_localizations: {
                                'pt-BR': 'Exibe as informações do usuário:',
                                'en-US': 'Shows the user\'s informations:'
                            },
                            required: false
                        }
                    ]
                }
            ]
        });
    }
}

export const UserSubCommandData = new UserSubCommandDataConstructor();