import { Ryuzaki } from '../../ryuzakiClient';
import { ListenerStructure } from '../../structures';
import { Events, PermissionFlagsBits, Collection, Invite } from 'discord.js';
import { Logger } from '../../utils';

export default class ClientReadyListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.ClientReady,
            once: true
        });
    }

    async eventExecute() {
        try {
            //===============> Módulos <===============//

            const { default: vipModule } = await import('../../modules/vipModule');
            new vipModule(this.client).moduleExecute();

            //===============> Finalizações <===============//

            //===============> Convite:

            this.client.guilds.cache.forEach(async (guild) => {
                const guildData = await this.client.getData(guild.id, 'guild');

                if (guildData && guildData.logs.invites) {
                    if (guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
                        const invites = await guild.invites.fetch();
                        const codeUses = new Collection<string, Invite>();

                        invites.each((inv) => codeUses.set(inv.code, inv));
                        this.client.invites.set(guild.id, codeUses);
                    }
                }
            });
        } catch (err) {
            Logger.error((err as Error).message, ClientReadyListener.name);
            Logger.warn((err as Error).stack, ClientReadyListener.name);
        }
    }
}