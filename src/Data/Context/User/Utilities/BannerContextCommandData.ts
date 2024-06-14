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
                registerSlash: true,
                args: false
            }
        });
    }
}

export const BannerContextCommandData = new BannerContextCommandDataConstructor();