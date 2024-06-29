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
    public constructor(public readonly options: RawContextCommandData) {
        this.options = options;
    }
}

abstract class ContextCommandStructure {
    public constructor(public readonly client: Ryuzaki, public readonly data: ContextCommandData) {
        this.client = client;
        this.data = data;

        this.validateOptions();
    }

    private validateOptions() {
        if (!this.data.options.name) {
            throw new Error('O nome do comando é obrigatório.');
        }

        if (![ApplicationCommandType.ChatInput, ApplicationCommandType.User, ApplicationCommandType.Message].includes(this.data.options.type)) {
            throw new Error('O tipo do comando deve ser um dos tipos suportados pela API.');
        }
    }

    public abstract commandExecute(...args: any[]): Promise<void> | void; 
}

export { ContextCommandStructure, ContextCommandData, RawContextCommandData };