import { GatewayIntentBits } from 'discord.js';
import { Ryuzaki } from '../RyuzakiClient';

const client: Ryuzaki = new Ryuzaki({
    intents: [
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    allowedMentions: {
        parse: [
            'users',
            'roles',
            'everyone'
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

export { client };