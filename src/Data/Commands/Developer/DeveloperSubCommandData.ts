import { CommandData } from '../../../Structures';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

class DeveloperSubCommandDataConstructor extends CommandData {
    constructor() {
        super({
            name: 'dev',
            description: 'Commands used only for developers',
            type: ApplicationCommandType.ChatInput,
            name_localizations: {
                'pt-BR': 'desenvolvedor',
                'en-US': 'developer'
            },
            description_localizations: {
                'pt-BR': 'Comandos utilizados somente pelos desenvolvedores',
                'en-US': 'Commands used only for developers'
            },
            category: {
                'pt-BR': 'Desenvolvedor',
                'en-US': 'Developer',
                'es-ES': 'Desarrollador'
            },
            aliases: {
                'pt-BR': ['desenvolvedor'],
                'en-US': ['developer']
            },
            usage: {
                'pt-BR': ['eval <código>'],
                'en-US': ['eval <code>']
            },
            permissions: {
                client: ['EmbedLinks'],
                member: []
            },
            config: {
                cooldown: 10,
                devOnly: true,
                interactionOnly: false,
                isDMAllowed: true,
                registerSlash: true,
                args: true
            },
            options: [
                {
                    name: 'eval',
                    description: 'Command to run some code',
                    type: ApplicationCommandOptionType.Subcommand,
                    description_localizations: {
                        'pt-BR': 'Comando para executar uma linha de comando',
                        'en-US': 'Command to run a command line'
                    },
                    options: [
                        {
                            name: 'code',
                            description: 'The code to run',
                            type: ApplicationCommandOptionType.String,
                            name_localizations: {
                                'pt-BR': 'código',
                                'en-US': 'code'
                            },
                            description_localizations: {
                                'pt-BR': 'O código para executar',
                                'en-US': 'The code to exec'
                            },
                            required: true
                        }
                    ]
                },
                {
                    name: 'blacklist',
                    description: 'Adds or removes an user from blacklist',
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    description_localizations: {
                        'pt-BR': 'Adiciona ou remove um usuário da lista negra',
                        'en-US': 'Adds or removes an user from blacklist'
                    },
                    options: [
                        {
                            name: 'add',
                            description: 'Adds an user to the blacklist',
                            type: ApplicationCommandOptionType.Subcommand,
                            name_localizations: {
                                'pt-BR': 'adicionar',
                                'en-US': 'add'
                            },
                            description_localizations: {
                                'pt-BR': 'Adiciona um usuário na lista negra',
                                'en-US': 'Adds an user to the blacklist'
                            },
                            options: [
                                {
                                    name: 'id',
                                    description: 'Enter an user ID:',
                                    type: ApplicationCommandOptionType.String,
                                    description_localizations: {
                                        'pt-BR': 'Insira um ID de usuário:',
                                        'en-US': 'Enter an user ID:'
                                    },
                                    required: false
                                }
                            ]
                        },
                        {
                            name: 'remove',
                            description: 'Removes an user from the blacklist',
                            type: ApplicationCommandOptionType.Subcommand,
                            name_localizations: {
                                'pt-BR': 'remover',
                                'en-US': 'remove'
                            },
                            description_localizations: {
                                'pt-BR': 'Remove um usuário da lista negra',
                                'en-US': 'Removes an user from the blacklist'
                            },
                            options: [
                                {
                                    name: 'id',
                                    description: 'Enter an user ID:',
                                    type: ApplicationCommandOptionType.String,
                                    description_localizations: {
                                        'pt-BR': 'Insira um ID de usuário:',
                                        'en-US': 'Enter an user ID:'
                                    },
                                    required: false
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'maintenance',
                    description: 'Removes or adds a command into maintenance',
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    name_localizations: {
                        'pt-BR': 'manutenção',
                        'en-US': 'maintenance'
                    },
                    description_localizations: {
                        'pt-BR': 'Remove ou adiciona um comando em manutenção',
                        'en-US': 'Removes or adds a command into maintenance'
                    },
                    options: [
                        {
                            name: 'add',
                            description: 'Adds a command or the client into maintenance',
                            type: ApplicationCommandOptionType.Subcommand,
                            name_localizations: {
                                'pt-BR': 'adicionar',
                                'en-US': 'add'
                            },
                            description_localizations: {
                                'pt-BR': 'Adiciona um comando ou o cliente em manutenção',
                                'en-US': 'Adds a command or the client into maintenance'
                            },
                            options: [
                                {
                                    name: 'command',
                                    description: 'The command to add on maintenance',
                                    type: ApplicationCommandOptionType.String,
                                    name_localizations: {
                                        'pt-BR': 'comando',
                                        'en-US': 'command'
                                    },
                                    description_localizations: {
                                        'pt-BR': 'O comando para adicionar na manutenção',
                                        'en-US': 'The command to add on maintenance'
                                    },
                                    required: false
                                },
                                {
                                    name: 'client',
                                    description: 'Adds the Ryuzaki for maintenance',
                                    type: ApplicationCommandOptionType.String,
                                    name_localizations: {
                                        'en-US': 'client',
                                        'pt-BR': 'cliente'
                                    },
                                    description_localizations: {
                                        'pt-BR': 'Adiciona o Ryuzaki para manutenção',
                                        'en-US': 'Adds the Ryuzaki for maintenance'
                                    },
                                    required: false,
                                    choices: [
                                        {
                                            name: 'add',
                                            value: 'add',
                                            name_localizations: {
                                                'pt-BR': 'adicionar',
                                                'en-US': 'add'
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'remove',
                            description: 'Removes a command or the client from maintenance',
                            type: ApplicationCommandOptionType.Subcommand,
                            name_localizations: {
                                'pt-BR': 'remover',
                                'en-US': 'remove'
                            },
                            description_localizations: {
                                'pt-BR': 'Remove um comando ou o cliente da manutenção',
                                'en-US': 'Removes a command or the client from maintenance'
                            },
                            options: [
                                {
                                    name: 'command',
                                    description: 'Removes a command from maintenance',
                                    type: ApplicationCommandOptionType.String,
                                    name_localizations: {
                                        'pt-BR': 'comando',
                                        'en-US': 'command'
                                    },
                                    description_localizations: {
                                        'pt-BR': 'Remove um comando da manutenção',
                                        'en-US': 'Removes a command from maintenance'
                                    },
                                    required: false
                                },
                                {
                                    name: 'client',
                                    description: 'Removes Ryuzaki from maintenance',
                                    type: ApplicationCommandOptionType.String,
                                    name_localizations: {
                                        'en-US': 'client',
                                        'pt-BR': 'cliente'
                                    },
                                    description_localizations: {
                                        'pt-BR': 'Remove o Ryuzaki da manutenção',
                                        'en-US': 'Removes Ryuzaki from maintenance'
                                    },
                                    required: false,
                                    choices: [
                                        {
                                            name: 'remove',
                                            value: 'remove',
                                            name_localizations: {
                                                'pt-BR': 'remover',
                                                'en-US': 'remove'
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
    }
}

export const DeveloperSubCommandData = new DeveloperSubCommandDataConstructor();