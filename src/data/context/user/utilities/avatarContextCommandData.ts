import { ContextCommandData } from '../../../../structures';
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
                args: false,
                ephemeral: true
            }
        });
    }
}

export const AvatarContextCommandData = new AvatarContextCommandDataConstructor();