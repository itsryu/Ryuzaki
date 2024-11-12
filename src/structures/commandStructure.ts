import { Ryuzaki } from '../ryuzakiClient';
import { PermissionResolvable, ApplicationCommandType, Message, ChatInputCommandInteraction } from 'discord.js';
import { type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Categories, CategoryValidation, Languages } from '../types/clientTypes';
import { Language } from '../utils/objects';

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
        ephemeral?: boolean;
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
    language?: Language;
    prefix?: string;
}

abstract class CommandStructure {
    public constructor(public readonly client: Ryuzaki, public readonly data: CommandData) {
        this.client = client;
        this.data = data;

        this.validateOptions();
    }

    private validateOptions() {
        if (!this.data.options.name) {
            throw new Error('The command name is required.');
        }

        if (![ApplicationCommandType.ChatInput, ApplicationCommandType.User, ApplicationCommandType.Message].includes(this.data.options.type)) {
            throw new Error('The command type must be one of the types supported by the API.');
        }
    }

    protected validateParams(params: CommandExecuteParams) {
        if (!params.message) {
            throw new Error('The message or interaction is required.');
        }

        if (!params.args || !Array.isArray(params.args)) {
            throw new Error('Arguments are required and must be an array.');
        }

        if (!params.language) {
            throw new Error('The language is required.');
        }

        if (!params.prefix) {
            throw new Error('The prefix is required.');
        }
    }

    public commandExecute(params: CommandExecuteParams): Promise<void> | void {
        this.validateParams(params);
    }
}

export { CommandStructure, CommandData, RawCommandData };
export type { Categories };