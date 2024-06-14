import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure } from '../../Structures/';
import { Events, PermissionFlagsBits, Collection, Invite } from 'discord.js';

export default class readyListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.ClientReady,
            once: true
        });
    }

    async eventExecute() {
        try {
            //===============> Módulos <===============//

            const { default: vipModule } = await import('../../Modules/vipModule');
            new vipModule(this.client).moduleExecute();
            

            //===============> Finalizações <===============//

            //===============> Convite:

            this.client.guilds.cache.forEach(async (guild) => {
                const guildDb = await this.client.getData(guild.id, 'guild');

                if (guildDb.logs.invites) {
                    if (guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
                        const invites = await guild.invites.fetch();
                        const codeUses = new Collection<string, Invite>();

                        invites.each((inv) => codeUses.set(inv.code, inv));
                        this.client.invites.set(guild.id, codeUses);
                    }
                }
            });

            this.client.logger.info(`${this.client.user?.username} has been loaded completely and it's in ${this.client.guilds.cache.size} guilds on port: ${process.env.SHARD_PORT}.`, `Ready - ${this.client.shard?.ids[0]}`);
        } catch (err) {
            this.client.logger.error((err as Error).message, readyListener.name);
            this.client.logger.warn((err as Error).stack!, readyListener.name);
        }
    }
}