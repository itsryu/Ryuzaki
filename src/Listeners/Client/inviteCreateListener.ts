import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure } from '../../Structures/';
import { Events, Guild, Invite, Collection, PermissionFlagsBits } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class inviteCreateListener extends ListenerStructure {
    private codeUses = new Collection<string, Invite>();

    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.InviteCreate
        });
    }

    async eventExecute(invite: Invite) {
        try {
            if (invite.guild) {
                const guild = invite.guild as Guild;
                const guildData = await this.client.getData(guild.id, 'guild');

                if (guildData && guildData.logs.status && guildData.logs.invites && guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
                    const invites = await guild.invites.fetch();

                    invites.each((inv) => this.codeUses.set(inv.code, inv));
                    this.client.invites.set(invite.guild.id, this.codeUses);
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, inviteCreateListener.name);
            Logger.warn((err as Error).stack, inviteCreateListener.name);
        }
    }
}