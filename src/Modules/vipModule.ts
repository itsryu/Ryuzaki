import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure } from '../Structures/';

export default class vipModule extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

    async moduleExecute() {
        try {
            await this.vipUsers();
        } catch (err) {
            this.client.logger.error((err as Error).message, vipModule.name);
            this.client.logger.warn((err as Error).stack!, vipModule.name);
        }
    }

    vipUsers() {
        setInterval(async () => {
            const vipArray = await this.client.database.users.find({ 'vip.date': { $gt: 1 } });
            const filter = Object.entries(vipArray).filter(([, x]) => x.vip.date <= Date.now());
            const map = filter.map(([, x]) => x._id);

            await this.removeVip(map);
        }, 30000);
    }

    removeVip(vips: string[]) {
        let vipSize = vips.length;
        let size = 0;

        const interval = setInterval(async () => {
            if (vipSize <= 0) {
                clearInterval(interval);
            } else {
                const members = vips[size++];
                const user = await this.client.users.fetch(members).catch(() => undefined);

                if (user) {
                    const userDb = await this.client.getData(user.id, 'user');

                    userDb.set({ 'vip.date': 0, 'vip.hasVip': false }).save();

                    user.send({ content: `${user}, o seu VIP foi removido.` }).catch(() => undefined);
                    this.client.logger.info(`Retirado o VIP de ${user.tag}`, 'VIP');
                }
            }
            vipSize--;
        }, 5000);
    }
}