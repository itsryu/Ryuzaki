type FlagText = Record<string, Record<string, string>>;

export enum Language {
    pt_BR = 'pt-BR',
    en_US = 'en-US',
}

enum PermissionsFlagsKeys {
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

enum UserFlagsKeys {
    Staff = 'Staff',
    Partner = 'Partner',
    Hypesquad = 'Hypesquad',
    BugHunterLevel1 = 'BugHunterLevel1',
    MFASMS = 'MFASMS',
    PremiumPromoDismissed = 'PremiumPromoDismissed',
    HypeSquadOnlineHouse1 = 'HypeSquadOnlineHouse1',
    HypeSquadOnlineHouse2 = 'HypeSquadOnlineHouse2',
    HypeSquadOnlineHouse3 = 'HypeSquadOnlineHouse3',
    PremiumEarlySupporter = 'PremiumEarlySupporter',
    TeamPseudoUser = 'TeamPseudoUser',
    HasUnreadUrgentMessages = 'HasUnreadUrgentMessages',
    BugHunterLevel2 = 'BugHunterLevel2',
    VerifiedBot = 'VerifiedBot',
    VerifiedDeveloper = 'VerifiedDeveloper',
    CertifiedModerator = 'CertifiedModerator',
    BotHTTPInteractions = 'BotHTTPInteractions',
    Spammer = 'Spammer',
    DisablePremium = 'DisablePremium',
    ActiveDeveloper = 'ActiveDeveloper',
    Quarantined = 'Quarantined',
    Collaborator = 'Collaborator',
    RestrictedCollaborator = 'RestrictedCollaborator'
}

const PermissionsFlagsText: FlagText = {
    [PermissionsFlagsKeys.CreateInstantInvite]: {
        [Language.pt_BR]: 'Criar convite',
        [Language.en_US]: 'Create Invite'
    },
    [PermissionsFlagsKeys.KickMembers]: {
        [Language.pt_BR]: 'Expulsar membros',
        [Language.en_US]: 'Kick Members'
    },
    [PermissionsFlagsKeys.BanMembers]: {
        [Language.pt_BR]: 'Banir Membros',
        [Language.en_US]: 'Ban Members'
    },
    [PermissionsFlagsKeys.Administrator]: {
        [Language.pt_BR]: 'Administrador',
        [Language.en_US]: 'Administrator'
    },
    [PermissionsFlagsKeys.ManageChannels]: {
        [Language.pt_BR]: 'Gerenciar canais',
        [Language.en_US]: 'Manage Channels'
    },
    [PermissionsFlagsKeys.ManageGuild]: {
        [Language.pt_BR]: 'Gerenciar servidor',
        [Language.en_US]: 'Manage Server'
    },
    [PermissionsFlagsKeys.AddReactions]: {
        [Language.pt_BR]: 'Adicionar reações',
        [Language.en_US]: 'Add Reactions'
    },
    [PermissionsFlagsKeys.ViewAuditLog]: {
        [Language.pt_BR]: 'Ver registro de auditoria',
        [Language.en_US]: 'View Audit Log'
    },
    [PermissionsFlagsKeys.PrioritySpeaker]: {
        [Language.pt_BR]: 'Voz prioritária',
        [Language.en_US]: 'Priority Speaker'
    },
    [PermissionsFlagsKeys.Stream]: {
        [Language.pt_BR]: 'Transmitir',
        [Language.en_US]: 'Stream'
    },
    [PermissionsFlagsKeys.ViewChannel]: {
        [Language.pt_BR]: 'Ver canal',
        [Language.en_US]: 'View Channel'
    },
    [PermissionsFlagsKeys.SendMessages]: {
        [Language.pt_BR]: 'Enviar mensagens',
        [Language.en_US]: 'Send Messages'
    },
    [PermissionsFlagsKeys.SendTTSMessages]: {
        [Language.pt_BR]: 'Enviar mensagens de TTS',
        [Language.en_US]: 'Send TTS Messages'
    },
    [PermissionsFlagsKeys.ManageMessages]: {
        [Language.pt_BR]: 'Gerenciar mensagens',
        [Language.en_US]: 'Manage Messages'
    },
    [PermissionsFlagsKeys.EmbedLinks]: {
        [Language.pt_BR]: 'Inserir links',
        [Language.en_US]: 'Embed Links'
    },
    [PermissionsFlagsKeys.AttachFiles]: {
        [Language.pt_BR]: 'Enviar arquivos',
        [Language.en_US]: 'Attach Files'
    },
    [PermissionsFlagsKeys.ReadMessageHistory]: {
        [Language.pt_BR]: 'Ver histórico de mensagens',
        [Language.en_US]: 'Read Message History'
    },
    [PermissionsFlagsKeys.MentionEveryone]: {
        [Language.pt_BR]: 'Mencionar todos',
        [Language.en_US]: 'Mention Everyone'
    },
    [PermissionsFlagsKeys.UseExternalEmojis]: {
        [Language.pt_BR]: 'Usar emojis externos',
        [Language.en_US]: 'Use External Emojis'
    },
    [PermissionsFlagsKeys.ViewGuildInsights]: {
        [Language.pt_BR]: 'Ver estatísticas do servidor',
        [Language.en_US]: 'View Guild Insights'
    },
    [PermissionsFlagsKeys.Connect]: {
        [Language.pt_BR]: 'Conectar',
        [Language.en_US]: 'Connect'
    },
    [PermissionsFlagsKeys.Speak]: {
        [Language.pt_BR]: 'Falar',
        [Language.en_US]: 'Speak'
    },
    [PermissionsFlagsKeys.MuteMembers]: {
        [Language.pt_BR]: 'Conectar',
        [Language.en_US]: 'Mute'
    },
    [PermissionsFlagsKeys.ManageNicknames]: {
        [Language.pt_BR]: 'Gerenciar apelidos',
        [Language.en_US]: 'Manage Nicknames'
    },
};

const UserFlagsText: FlagText = {
    [UserFlagsKeys.BugHunterLevel1]: {
        [Language.pt_BR]: 'Caçador de Bugs Nível 1',
        [Language.en_US]: 'Bug Hunter Level 1'
    },
    [UserFlagsKeys.HypeSquadOnlineHouse1]: {
        [Language.pt_BR]: 'House of Bravery',
        [Language.en_US]: 'House of Bravery'
    },
    [UserFlagsKeys.HypeSquadOnlineHouse2]: {
        [Language.pt_BR]: 'House of Brilliance',
        [Language.en_US]: 'House of Brilliance'
    },
    [UserFlagsKeys.HypeSquadOnlineHouse3]: {
        [Language.pt_BR]: 'House of Balance',
        [Language.en_US]: 'House of Balance'
    },
    [UserFlagsKeys.PremiumEarlySupporter]: {
        [Language.pt_BR]: 'Apoiador Inicial',
        [Language.en_US]: 'Early Supporter'
    },
    [UserFlagsKeys.TeamPseudoUser]: {
        [Language.pt_BR]: 'Usuário da Equipe',
        [Language.en_US]: 'Team User'
    },
    [UserFlagsKeys.BugHunterLevel2]: {
        [Language.pt_BR]: 'Caçador de Bugs Nível 2',
        [Language.en_US]: 'Bug Hunter Level 2'
    },
    [UserFlagsKeys.VerifiedBot]: {
        [Language.pt_BR]: 'Bot Verificado',
        [Language.en_US]: 'Verified Bot'
    },
    [UserFlagsKeys.VerifiedDeveloper]: {
        [Language.pt_BR]: 'Desenvolvedor de Bot Verificado',
        [Language.en_US]: 'Verified Bot Developer'
    },
    [UserFlagsKeys.Staff]: {
        [Language.pt_BR]: 'Funcionário do Discord',
        [Language.en_US]: 'Discord Employee'
    },
    [UserFlagsKeys.Partner]: {
        [Language.pt_BR]: 'Dono de servidor parceiro',
        [Language.en_US]: 'Partnered Server Owner'
    },
    [UserFlagsKeys.Hypesquad]: {
        [Language.pt_BR]: 'Membro do HypeSquad',
        [Language.en_US]: 'HypeSquad Events Member'
    },
    [UserFlagsKeys.MFASMS]: {
        [Language.pt_BR]: 'MFA SMS',
        [Language.en_US]: 'MFA SMS'
    },
    [UserFlagsKeys.PremiumPromoDismissed]: {
        [Language.pt_BR]: 'Promoção Premium Ignorada',
        [Language.en_US]: 'Premium Promo Dismissed'
    },
    [UserFlagsKeys.HasUnreadUrgentMessages]: {
        [Language.pt_BR]: 'Mensagens Urgentes Não Lidas',
        [Language.en_US]: 'Has Unread Urgent Messages'
    },
    [UserFlagsKeys.Spammer]: {
        [Language.pt_BR]: 'Spammer',
        [Language.en_US]: 'Spammer'
    },
    [UserFlagsKeys.ActiveDeveloper]: {
        [Language.pt_BR]: 'Desenvolvedor Ativo',
        [Language.en_US]: 'Active Developer'
    },
    [UserFlagsKeys.Quarantined]: {
        [Language.pt_BR]: 'Quarentena',
        [Language.en_US]: 'Quarantined'
    },
    [UserFlagsKeys.Collaborator]: {
        [Language.pt_BR]: 'Colaborador',
        [Language.en_US]: 'Collaborator'
    },
    [UserFlagsKeys.RestrictedCollaborator]: {
        [Language.pt_BR]: 'Colaborador Restrito',
        [Language.en_US]: 'Restricted Collaborator'
    },
    [UserFlagsKeys.CertifiedModerator]: {
        [Language.pt_BR]: 'Moderador Certificado',
        [Language.en_US]: 'Certified Moderator'
    },
    [UserFlagsKeys.BotHTTPInteractions]: {
        [Language.pt_BR]: 'Interações HTTP de Bot',
        [Language.en_US]: 'Bot HTTP Interactions'
    },
    [UserFlagsKeys.DisablePremium]: {
        [Language.pt_BR]: 'Desativar Premium',
        [Language.en_US]: 'Disable Premium'
    }
}

type PermissionFlagKey = keyof typeof PermissionsFlagsKeys;
type UserFlagKey = keyof typeof UserFlagsKeys;

export type { PermissionFlagKey, UserFlagKey };
export { PermissionsFlagsText, UserFlagsText };