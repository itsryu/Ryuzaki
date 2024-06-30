import { ContextCommandData } from '../../../../Structures';
import { ApplicationCommandType } from 'discord.js';

class BannerContextCommandDataConstructor extends ContextCommandData {
    constructor() {
        super({
            name: 'Banner',
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

export const BannerContextCommandData = new BannerContextCommandDataConstructor();