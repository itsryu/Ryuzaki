import { ContextCommandData } from '../../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class AvatarContextCommandDataConstructor extends ContextCommandData {
    constructor() {
        super({
            name: 'Avatar',
            type: ApplicationCommandType.User,
            permissions: {
                client: ['EmbedLinks'],
                member: []
            },
            config: {
                cooldown: 10,
                devOnly: false,
                interactionOnly: true,
                isDMAllowed: true,
                registerSlash: true,
                args: false
            }
        });
    }
}

export const AvatarContextCommandData = new AvatarContextCommandDataConstructor();