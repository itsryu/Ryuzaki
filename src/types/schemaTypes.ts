import { Document } from 'mongoose';

interface Reputation extends Document {
    user: string;
    from: string;
    reputation: string;
    time: number;
}

export interface Reminder extends Document{
    reminder: string;
    channel: string;
    time: number;
}

interface ClientDocument extends Document {
    _id: string;
    maintenance: boolean;
    blacklist: string[];
    reason: string;
    ranks: {
        coins: string[]
    };
    uptime: number;
    clientProfile: {
        layouts: string[];
        backgrounds: string[];
    }
}

interface CommandDocument extends Document {
    _id: string,
    usages: number,
    maintenance: boolean,
    reason: string
}

interface GuildDocument extends Document {
    _id: string,
    prefix: string,
    lang: string,
    cmdblock: {
        status: boolean,
        channels: string[],
        cmds: string[],
        msg: string
    },
    exp: {
        status: boolean,
        channels: string[],
        roles: string[]
    },
    logs: {
        status: boolean,
        channel: string,
        messages: boolean,
        calls: boolean,
        moderation: boolean,
        invites: boolean
    },
    serverstats: {
        status: boolean,
        channels: {
            bot: string,
            users: string,
            total: string,
            category: string
        }
    },
    counter: {
        status: boolean,
        channel: string,
        msg: string
    },
    notification: {
        role: string,
        status: boolean
    },
    antinvite: {
        msg: string,
        status: boolean,
        channels: string[],
        roles: string[]
    },
    antifake: {
        status: boolean,
        days: number
    },
    antispam: {
        status: boolean,
        channels: string[],
        timeout: number,
        limit: number
    },
    mutes: {
        list: string[]
    },
    call: {
        channels: string[],
        roles: string[]
    },
    ticket: {
        guild: string,
        channel: string,
        category: string,
        msg: string,
        size: number,
        staff: string
    },
    starboard: {
        status: boolean,
        channel: string,
        reactions: number
    },
    vip: {
        roles: string[],
        category: string
    }
}

interface UserDocument extends Document {
    _id: string,
    prefix: string,
    lang: string,
    commands: {
        usages: number
    }
    about: string,
    profile: {
        layout: number,
        background: string
    },
    economy: {
        coins: number,
        bank: number,
        daily: number,
        work: number,
        vote: number,
        votes: number
    },
    exp: {
        xp: number,
        totalXp: number,
        level: number,
        nextLevel: number,
        id: string,
        user: string
    },
    vip: {
        status: boolean,
        date: number
    },
    reps: {
        array: Reputation[],
        time: number
    },
    reminder: {
        reminderList: Reminder[],
        isDm: boolean
    },
    marry: {
        time: number,
        user: string,
        has: boolean
    },
    steal: {
        time: number,
        protection: number
    },
    call: {
        lastCall: number,
        totalCall: number,
        lastRegister: number,
        status: boolean
    },
    AFK: {
        away: boolean,
        lastNickname: string,
        reason: string | null
    },
    warn: {
        reason: string[],
        has: number
    },
    ticket: {
        have: boolean,
        channel: string,
        created: string
    }
}

export type { ClientDocument, CommandDocument, GuildDocument, UserDocument };