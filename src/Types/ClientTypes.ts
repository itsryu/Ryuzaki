import { Collection, Emoji, PartialEmoji } from 'discord.js';
import { GuildDocument, UserDocument, ClientDocument, CommandDocument } from './SchemaTypes';

type DataType = 'user' | 'guild' | 'client' | 'command';
type Languages = 'pt-BR' | 'en-US' | 'es-ES';

interface CategoryNames {
    'pt-BR': 'Desenvolvedor' | 'Informações' | 'Moderação' | 'Economia' | 'Utilidades' | 'Interação' | 'Diversão' | 'Configurações';
    'en-US': 'Developer' | 'Infos' | 'Moderation' | 'Economy' | 'Utilities' | 'Interaction' | 'Fun' | 'Settings';
    'es-ES': 'Desarrollador' | 'Infos' | 'Moderación' | 'Economía' | 'Utilidades' | 'Interacción' | 'Diversión' | 'Ajustes';
}

type Categories = CategoryNames[Languages];

type CategoryValidation<T extends keyof CategoryNames> = {
    [K in T]: K extends Languages ? CategoryNames[K] : never;
};

type CategoryEmojis = {
    [key in Languages]: {
        [category in CategoryNames[key]]: PartialEmoji | Emoji | string;
    };
};

interface Shards {
    shardMemory: number;
    servers: Collection<string, { memory: number }>;
}

interface ShardMemory {
    totalMemory: number;
    shards: Record<number, Shards>;
}

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
    Categories,
    CategoryValidation,
    CategoryEmojis,
    DataDocument,
    ShardMemory
};