import { Ryuzaki } from '../RyuzakiClient';
import { PermissionResolvable, ApplicationCommandType, Message, ChatInputCommandInteraction } from 'discord.js';
import { type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Categories, CategoryValidation, Languages } from '../Types/ClientTypes';

interface RawCommandData extends RESTPostAPIChatInputApplicationCommandsJSONBody {
    name: string;
    type: ApplicationCommandType.ChatInput;
    category: CategoryValidation<Languages>;
    aliases: Partial<Record<Languages, string[]>>;
    usage: Partial<Record<Languages, string[]>>;
    permissions: {
        client: PermissionResolvable[],
        member: PermissionResolvable[]
    };
    config: {
        cooldown: number,
        devOnly: boolean,
        interactionOnly: boolean,
        isDMAllowed: boolean,
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

interface CommandExecuteParams {
    message?: Message | ChatInputCommandInteraction;
    args?: string[];
    language?: Languages;
    prefix?: string;
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

    abstract commandExecute(params: CommandExecuteParams): Promise<void> | void;
}

export { CommandStructure, CommandData, RawCommandData };
export type { Categories };