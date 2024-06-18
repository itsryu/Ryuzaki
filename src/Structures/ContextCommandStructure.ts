import { Ryuzaki } from '../RyuzakiClient';
import { PermissionResolvable, ApplicationCommandType } from 'discord.js';
import { type RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord-api-types/v10';

interface RawContextCommandData extends RESTPostAPIContextMenuApplicationCommandsJSONBody {
    name: string;
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

abstract class ContextCommandData {
    options: RawContextCommandData;

    constructor(options: RawContextCommandData) {
        this.options = options;
    }
}

abstract class ContextCommandStructure {
    client: Ryuzaki;
    data: ContextCommandData;

    constructor(client: Ryuzaki, data: ContextCommandData) {
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

export { ContextCommandStructure, ContextCommandData, RawContextCommandData };