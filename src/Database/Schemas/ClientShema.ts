import { Schema, Model, model } from 'mongoose';
import { ClientDocument } from '../../Types/SchemaTypes';

const ClientSchema = new Schema<ClientDocument>({
    _id: {
        type: Schema.Types.String,
        default: null
    },
    maintenance: {
        type: Schema.Types.Boolean,
        default: false
    },
    blacklist: {
        type: [Schema.Types.String],
        default: []
    },
    ranks: {
        coins: {
            type: Schema.Types.Array,
            default: []
        }
    },
    uptime: {
        type: Schema.Types.Number,
        default: 0
    },
    clientProfile: {
        layouts: {
            type: [Schema.Types.String],
            default: []
        },
        backgrounds: {
            type: [Schema.Types.String],
            default: []
        }
    }
});

const ClientModel: Model<ClientDocument> = model('client', ClientSchema);

export { ClientModel };