type FlagText = Record<string, Record<string, string>>;

enum Language {
    PT_BR = 'pt-BR',
    EN_US = 'en-US',
}

enum flagKeys {
    CreateInstantInvite = 'CreateInstantInvite',
    KickMembers = 'KickMembers',
    BanMembers = 'BanMembers',
    Administrator = 'Administrator',
    ManageChannels = 'ManageChannels',
    ManageGuild = 'ManageGuild',
    AddReactions = 'AddReactions',
    ViewAuditLog = 'ViewAuditLog',
    PrioritySpeaker = 'PrioritySpeaker',
    Stream = 'Stream',
    ViewChannel = 'ViewChannel',
    SendMessages = 'SendMessages',
    SendTTSMessages = 'SendTTSMessages',
    ManageMessages = 'ManageMessages',
    EmbedLinks = 'EmbedLinks',
    AttachFiles = 'AttachFiles',
    ReadMessageHistory = 'ReadMessageHistory',
    MentionEveryone = 'MentionEveryone',
    UseExternalEmojis = 'UseExternalEmojis',
    ViewGuildInsights = 'ViewGuildInsights',
    Connect = 'Connect',
    Speak = 'Speak',
    MuteMembers = 'MuteMembers',
    DeafenMembers = 'DeafenMembers',
    MoveMembers = 'MoveMembers',
    UseVAD = 'UseVAD',
    ChangeNickname = 'ChangeNickname',
    ManageNicknames = 'ManageNicknames',
    ManageRoles = 'ManageRoles',
    ManageWebhooks = 'ManageWebhooks',
    ManageEmojisAndStickers = 'ManageEmojisAndStickers',
    UseApplicationCommands = 'UseApplicationCommands',
    RequestToSpeak = 'RequestToSpeak',
    ManageEvents = 'ManageEvents',
    ManageThreads = 'ManageThreads',
    CreatePublicThreads = 'CreatePublicThreads',
    CreatePrivateThreads = 'CreatePrivateThreads',
    UseExternalStickers = 'UseExternalStickers',
    SendMessagesInThreads = 'SendMessagesInThreads',
    UseEmbeddedActivities = 'UseEmbeddedActivities',
    ModerateMembers = 'ModerateMembers'
}

type FlagKey = keyof typeof flagKeys;

const flagTexts: FlagText = {
    [flagKeys.CreateInstantInvite]: {
        [Language.PT_BR]: 'Criar convite',
        [Language.EN_US]: 'Create Invite'
    },
    [flagKeys.KickMembers]: {
        [Language.PT_BR]: 'Expulsar membros',
        [Language.EN_US]: 'Kick Members'
    },
    [flagKeys.BanMembers]: {
        [Language.PT_BR]: 'Banir Membros',
        [Language.EN_US]: 'Ban Members'
    },
    [flagKeys.Administrator]: {
        [Language.PT_BR]: 'Administrador',
        [Language.EN_US]: 'Administrator'
    },
    [flagKeys.ManageChannels]: {
        [Language.PT_BR]: 'Gerenciar canais',
        [Language.EN_US]: 'Manage Channels'
    },
    [flagKeys.ManageGuild]: {
        [Language.PT_BR]: 'Gerenciar servidor',
        [Language.EN_US]: 'Manage Server'
    },
    [flagKeys.AddReactions]: {
        [Language.PT_BR]: 'Adicionar reações',
        [Language.EN_US]: 'Add Reactions'
    },
    [flagKeys.ViewAuditLog]: {
        [Language.PT_BR]: 'Ver registro de auditoria',
        [Language.EN_US]: 'View Audit Log'
    },
    [flagKeys.PrioritySpeaker]: {
        [Language.PT_BR]: 'Voz prioritária',
        [Language.EN_US]: 'Priority Speaker'
    },
    [flagKeys.Stream]: {
        [Language.PT_BR]: 'Transmitir',
        [Language.EN_US]: 'Stream'
    },
    [flagKeys.ViewChannel]: {
        [Language.PT_BR]: 'Ver canal',
        [Language.EN_US]: 'View Channel'
    },
    [flagKeys.SendMessages]: {
        [Language.PT_BR]: 'Enviar mensagens',
        [Language.EN_US]: 'Send Messages'
    },
    [flagKeys.SendTTSMessages]: {
        [Language.PT_BR]: 'Enviar mensagens de TTS',
        [Language.EN_US]: 'Send TTS Messages'
    },
    [flagKeys.ManageMessages]: {
        [Language.PT_BR]: 'Gerenciar mensagens',
        [Language.EN_US]: 'Manage Messages'
    },
    [flagKeys.EmbedLinks]: {
        [Language.PT_BR]: 'Inserir links',
        [Language.EN_US]: 'Embed Links'
    },
    [flagKeys.AttachFiles]: {
        [Language.PT_BR]: 'Enviar arquivos',
        [Language.EN_US]: 'Attach Files'
    },
    [flagKeys.ReadMessageHistory]: {
        [Language.PT_BR]: 'Ver histórico de mensagens',
        [Language.EN_US]: 'Read Message History'
    },
    [flagKeys.MentionEveryone]: {
        [Language.PT_BR]: 'Mencionar todos',
        [Language.EN_US]: 'Mention Everyone'
    },
    [flagKeys.UseExternalEmojis]: {
        [Language.PT_BR]: 'Usar emojis externos',
        [Language.EN_US]: 'Use External Emojis'
    },
    [flagKeys.ViewGuildInsights]: {
        [Language.PT_BR]: 'Ver estatísticas do servidor',
        [Language.EN_US]: 'View Guild Insights'
    },
    [flagKeys.Connect]: {
        [Language.PT_BR]: 'Conectar',
        [Language.EN_US]: 'Connect'
    },
    [flagKeys.Speak]: {
        [Language.PT_BR]: 'Falar',
        [Language.EN_US]: 'Speak'
    },
    [flagKeys.MuteMembers]: {
        [Language.PT_BR]: 'Conectar',
        [Language.EN_US]: 'Mute'
    }
};

export type { FlagKey };
export { flagTexts };