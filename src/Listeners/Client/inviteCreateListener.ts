import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure } from '../../Structures/';
import { Events, Guild, Invite, Collection, PermissionFlagsBits } from 'discord.js';

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
                const guildDb = await this.client.getData(guild.id, 'guild');

                if (guildDb.logs.status && guildDb.logs.invites && guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
                    const invites = await guild.invites.fetch();

                    invites.each((inv) => this.codeUses.set(inv.code, inv));
                    this.client.invites.set(invite.guild.id, this.codeUses);
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, inviteCreateListener.name);
            this.client.logger.warn((err as Error).stack!, inviteCreateListener.name);
        }
    }
}