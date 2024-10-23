import { CommandData } from '../../../structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class GuildSubCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'server',
            description: 'General server commands',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'servidor',
                'en-US': 'server'
            },
            description_localizations: {
                'pt-BR': 'Comandos gerais de servidor',
                'en-US': 'General server commands'
            },
            category: {
                'pt-BR': 'Utilidades',
                'en-US': 'Utilities',
                'es-ES': 'Utilidades'
            },
            aliases: {
                'pt-BR': ['servidor'],
                'en-US': ['guild']
            },
            usage: {
                'pt-BR': ['image banner|icon [id]', 'info [id]'],
                'en-US': ['image banner|icon [id]', 'info [id]']
            },
            permissions: {
                client: ['EmbedLinks'],
                member: []
            },
            config: {
                cooldown: 10,
                devOnly: false,
                interactionOnly: false,
                isDMAllowed: false,
                registerSlash: true,
                args: true,
                ephemeral: true
            },
            options: [
                {
                    name: 'image',
                    description: 'Displays server icon or banner',
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    name_localizations: {
                        'pt-BR': 'imagem',
                        'en-US': 'image'
                    },
                    description_localizations: {
                        'pt-BR': 'Exibe o ícone ou banner do servidor',
                        'en-US': 'Displays server icon or banner'
                    },
                    options: [
                        {
                            name: 'icon',
                            description: 'Display the server icon',
                            type: ApplicationCommandOptionType.Subcommand,
                            name_localizations: {
                                'pt-BR': 'ícone',
                                'en-US': 'icon'
                            },
                            description_localizations: {
                                'pt-BR': 'Exibe o ícone do servidor',
                                'en-US': 'Display the server icon'
                            },
                            required: false
                        },
                        {
                            name: 'banner',
                            description: 'Displays the server banner',
                            type: ApplicationCommandOptionType.Subcommand,
                            description_localizations: {
                                'pt-BR': 'Exibe o banner do servidor',
                                'en-US': 'Displays the server banner'
                            },
                            required: false
                        }
                    ]
                },
                {
                    name: 'info',
                    description: 'Displays server informations',
                    type: ApplicationCommandOptionType.Subcommand,
                    description_localizations: {
                        'pt-BR': 'Exibe informações do servidor',
                        'en-US': 'Displays server informations'
                    }
                }
            ]
        });
    }
}

export const GuildSubCommandData = new GuildSubCommandDataConstructor();