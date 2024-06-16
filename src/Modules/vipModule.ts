import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure } from '../Structures/';

export default class VipModule extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

    async moduleExecute() {
        try {
            this.vipUsers();
        } catch (err) {
            this.client.logger.error((err as Error).message, VipModule.name);
            this.client.logger.warn((err as Error).stack!, VipModule.name);
        }
    }

    private vipUsers() {
        setInterval(async () => {
            const vipArray = await this.client.database.users.find({ 'vip.date': { $gt: 1 } });
            const filter = Object.entries(vipArray).filter(([, x]) => x.vip.date <= Date.now());
            const map = filter.map(([, x]) => x._id);

            this.removeVip(map);
        }, 30000);
    }

    private removeVip(vips: string[]) {
        let vipSize = vips.length;
        let size = 0;

        const interval = setInterval(async () => {
            if (vipSize <= 0) {
                clearInterval(interval);
            } else {
                const members = vips[size++];
                const user = await this.client.users.fetch(members).catch(() => undefined);

                if (user) {
                    const userData = await this.client.getData(user.id, 'user');

                    await userData.set({ 'vip.date': 0, 'vip.hasVip': false }).save();

                    user.send({ content: `${user}, o seu VIP foi removido.` }).catch(() => undefined);
                    this.client.logger.info(`Retirado o VIP de ${user.tag}`, 'VIP');
                }
            }
            vipSize--;
        }, 5000);
    }
}