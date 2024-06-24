import { GatewayIntentBits, Partials } from 'discord.js';
import { Ryuzaki } from './RyuzakiClient';
import { extend } from 'dayjs';
import 'dayjs/locale/pt';
import 'dayjs/locale/en';

const client = new Ryuzaki({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.Reaction
    ],
    allowedMentions: {
        parse: [
            'users',
            'roles'
        ],
        repliedUser: true
    },
    rest: {
        version: '10'
    },
    presence: {
        status: process.env.STATE == 'development' ? 'idle' : 'online'
    }
});

(async () => {
    await client.initialize();
    extend((await import('dayjs/plugin/localizedFormat')).default);
    extend((await import('dayjs/plugin/duration')).default);
    extend((await import('dayjs/plugin/utc')).default);
    extend((await import('dayjs/plugin/relativeTime')).default);
})();
