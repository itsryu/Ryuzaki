import { GuildDocument, UserDocument, ClientDocument, CommandDocument } from './SchemaTypes';

type DataType = 'user' | 'guild' | 'client' | 'command';
type Languages = 'pt-BR' | 'en-US';

type DataDocument<T extends DataType> = T extends 'guild'
    ? GuildDocument & Required<{ _id: string }>
    : T extends 'user'
    ? UserDocument & Required<{ _id: string }>
    : T extends 'client'
    ? ClientDocument & Required<{ _id: string }>
    : T extends 'command'
    ? CommandDocument & Required<{ _id: string }>
    : never;

export type {
    DataType,
    Languages,
    DataDocument
};