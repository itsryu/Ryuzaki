import { Ryuzaki } from '../RyuzakiClient';
import { PermissionResolvable, ApplicationCommandType } from 'discord.js';
import { type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';

interface RawCommandData extends RESTPostAPIChatInputApplicationCommandsJSONBody {
    name: string;
    type: ApplicationCommandType.ChatInput;
    category: {
        'pt-BR': string;
        'en-US': string;
    };
    aliases: {
        'pt-BR': string[],
        'en-US': string[]
    };
    usage: {
        'pt-BR': string[],
        'en-US': string[]
    };
    permissions: {
        client: PermissionResolvable[],
        member: PermissionResolvable[]
    };
    config: {
        cooldown: number,
        devOnly: boolean,
        interactionOnly: boolean,
        registerSlash: boolean,
        args: boolean
    };
}

abstract class CommandData {
    options: RawCommandData;

    constructor(options: RawCommandData) {
        this.options = options;
    }
}

abstract class CommandStructure {
    client: Ryuzaki;
    data: CommandData;

    constructor(client: Ryuzaki, data: CommandData) {
        this.client = client;
        this.data = data;

        this.validateOptions();
    }

    validateOptions() {
        if (!this.data.options.name) {
            throw new Error('O nome do comando é obrigatório.');
        }

        if (![ApplicationCommandType.ChatInput, ApplicationCommandType.User, ApplicationCommandType.Message].includes(this.data.options.type)) {
            throw new Error('O tipo do comando deve ser um dos tipos suportados pela API.');
        }
    }

    abstract commandExecute(...args: any[]): Promise<void> | void;
}

export { CommandStructure, CommandData, RawCommandData };