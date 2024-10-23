import { Schema,Model, model } from 'mongoose';
import { CommandDocument } from '../../types';

const CommandSchema = new Schema<CommandDocument>({
    _id: {
        type: Schema.Types.String,
        default: null
    },
    usages: {
        type: Schema.Types.Number,
        default: 0
    },
    maintenance: {
        type: Schema.Types.Boolean,
        default: false

    }
});

const CommandModel: Model<CommandDocument> = model('command', CommandSchema);

export { 
    CommandModel 
};