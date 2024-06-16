import { Schema, Model, model } from 'mongoose';
import { UserDocument } from '../../Types/SchemaTypes';

const userSchema = new Schema<UserDocument>({
    _id: {
        type: Schema.Types.String,
        require: true
    },
    about: {
        type: Schema.Types.String,
        default: null
    },
    profile: {
        layout: {
            type: Schema.Types.Number,
            default: 0
        },
        background: {
            type: Schema.Types.String,
            default: null
        }
    },
    economy: {
        coins: {
            type: Number,
            default: 0
        },
        bank: {
            type: Number,
            default: 0
        },
        daily: {
            type: Number,
            default: 0
        },
        work: {
            type: Number,
            default: 0 
        },
        vote: {
            type: Number,
            default: 0
        }, 
        votes: {
            type: Number,
            default: 0
        }
    },
    exp: {
        xp: {
            type: Schema.Types.Number,
            default: 1
        },
        level: {
            type: Schema.Types.Number,
            default: 1
        },
        nextLevel: {
            type: Schema.Types.Number,
            default: 100
        },
        id: {
            type: Schema.Types.String,
            default: null
        },
        user: {
            type: Schema.Types.String,
            default: null
        }
    },
    vip: {
        status: {
            type: Schema.Types.Boolean,
            default: false
        },
        date: {
            type: Schema.Types.Number,
            default: 0
        }
    },
    reps: {
        array: {
            type: [Schema.Types.String],
            default: []
        },
        time: {
            type: Schema.Types.Number,
            default: 0
        }
    },
    reminder: {
        reminderList: {
            type: [Schema.Types.String],
            default: []
        },
        isDm: {
            type: Schema.Types.Boolean,
            default: false
        }
    },
    marry: {
        time: {
            type: Schema.Types.Number,
            default: 0
        },
        user: {
            type: Schema.Types.String,
            default: null
        },
        has: {
            type: Schema.Types.Boolean,
            default: false
        }
    },
    steal: {
        time: {
            type: Schema.Types.Number,
            default: 0
        },
        protection: {
            type: Schema.Types.Number,
            default: 0
        }
    },
    call: {
        lastCall: {
            type: Schema.Types.Number,
            default: 0
        },
        totalCall: {
            type: Schema.Types.Number,
            default: 0
        },
        lastRegister: {
            type: Schema.Types.Number,
            default: 0
        }
    },
    AFK: {
        away: {
            type: Schema.Types.Boolean,
            default: false
        },
        lastNickname: {
            type: Schema.Types.String,
            default: null
        },
        reason: {
            type: Schema.Types.String,
            default: null
        }
    },
    warn: {
        reason: {
            type: [Schema.Types.String]
        },
        has: {
            type: Schema.Types.Number,
            default: 0
        }
    },
    ticket: {
        have: {
            type: Schema.Types.Boolean,
            default: false
        },
        channel: {
            type: Schema.Types.String,
            default: null
        },
        created: {
            type: Schema.Types.String,
            default: null
        }
    }
});

const UserModel: Model<UserDocument> = model('user', userSchema);

export { UserModel };