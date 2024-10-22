import { Model, Schema, model } from 'mongoose';
import { GuildDocument } from '../../types/schemaTypes';

const GuildSchema = new Schema<GuildDocument>({
    _id: {
        type: Schema.Types.String,
        default: null
    },
    prefix: {
        type: Schema.Types.String,
        default: 'r.'
    },
    lang: {
        type: Schema.Types.String,
        default: 'pt-BR'
    },
    cmdblock: {
        status: {
            type: Schema.Types.Boolean,
            default: false
        },
        channels: {
            type: [Schema.Types.String],
            default: []
        },
        cmds: {
            type: [Schema.Types.String],
            default: []
        },
        msg: {
            type: Schema.Types.String,
            default: '{member}, o comando `{command}` foi bloqueado no canal {channel}.'
        }
    },
    exp: {
        status: {
            type: Schema.Types.Boolean,
            default: false
        },
        channels: {
            type: [Schema.Types.String],
            default: []
        },
        roles: {
            type: [Schema.Types.String],
            default: []
        }
    },
    logs: {
        status: {
            type: Schema.Types.Boolean,
            default: false
        },
        channel: {
            type: Schema.Types.String,
            default: null
        },
        messages: {
            type: Schema.Types.Boolean,
            default: true
        },
        calls: {
            type: Schema.Types.Boolean,
            default: true
        },
        moderation: {
            type: Schema.Types.Boolean,
            default: true
        },
        invites: {
            type: Schema.Types.Boolean,
            default: true
        }
    },
    serverstats: {
        status: {
            type: Schema.Types.Boolean,
            default: false
        },
        channels: {
            bot: {
                type: Schema.Types.String,
                default: null
            },
            users: {
                type: Schema.Types.String,
                default: null
            },
            total: {
                type: Schema.Types.String,
                default: null
            },
            category: {
                type: Schema.Types.String,
                default: null
            }
        }
    },
    counter: {
        status: {
            type: Schema.Types.Boolean,
            default: false
        },
        channel: {
            type: Schema.Types.String,
            default: null
        },
        msg: {
            type: Schema.Types.String,
            default: '{guild} | Temos {members} membros no servidor!'
        }
    },
    notification: {
        role: {
            type: Schema.Types.String,
            default: null
        },
        status: {
            type: Schema.Types.Boolean,
            default: false
        }
    },
    antinvite: {
        msg: {
            type: Schema.Types.String,
            default: '{user}, é estritamente proibida a divulgação de outros servidores no `{guild}`'
        },
        status: {
            type: Schema.Types.Boolean,
            default: false
        },
        channels: {
            type: [Schema.Types.String],
            default: []
        },
        roles: {
            type: [Schema.Types.String],
            default: []
        }
    },
    antifake: {
        status: {
            type: Schema.Types.Boolean,
            default: false
        },
        days: {
            type: Schema.Types.Number,
            default: 0
        }
    },
    antispam: {
        status: {
            type: Schema.Types.Boolean,
            default: false
        },
        channels: {
            type: [Schema.Types.String],
            default: []
        },
        timeout: {
            type: Schema.Types.Number,
            default: 60000 * 2
        },
        limit: {
            type: Schema.Types.Number,
            default: 5
        }
    },
    mutes: {
        list: {
            type: [Schema.Types.String],
            default: []
        }
    },
    call: {
        channels: {
            type: [Schema.Types.String],
            default: []
        },
        roles: {
            type: [Schema.Types.String],
            default: []
        }
    },
    ticket: {
        guild: {
            type: Schema.Types.String,
            default: null
        },
        channel: {
            type: Schema.Types.String,
            default: null
        },
        category: {
            type: Schema.Types.String,
            default: null
        },
        msg: {
            type: Schema.Types.String,
            default: null
        },
        size: {
            type: Schema.Types.Number,
            default: 0
        },
        staff: {
            type: Schema.Types.String,
            default: null
        }
    },
    starboard: {
        status: {
            type: Schema.Types.Boolean,
            default: false
        },
        channel: {
            type: Schema.Types.String,
            default: null
        },
        reactions: {
            type: Schema.Types.Number,
            default: 3
        }
    },
    vip: {
        roles: {
            type: [Schema.Types.String],
            default: null
        },
        category: {
            type: Schema.Types.String,
            default: null
        }
    }
});

const GuildModel: Model<GuildDocument> = model('guild', GuildSchema);

export { 
    GuildModel 
};