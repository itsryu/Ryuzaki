import { Ryuzaki } from '../RyuzakiClient';
import { ModuleStructure } from '../Structures';
import { Logger } from '../Utils/logger';

export default class VipModule extends ModuleStructure {
    moduleExecute() {
        try {
            this.vipUsers();
        } catch (err) {
            Logger.error((err as Error).message, VipModule.name);
            Logger.warn((err as Error).stack, VipModule.name);
        }
    }

    private vipUsers() {
        setInterval(async () => {
            const vipArray = await Ryuzaki.database.users.find({ 'vip.date': { $gt: 1 } });
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

                    if (userData) {
                        await userData.set({ 'vip.date': 0, 'vip.hasVip': false }).save();

                        user.send({ content: user.toString() + ', o seu VIP foi removido.' }).catch(() => undefined);
                        Logger.info(`Retirado o VIP de ${user.tag}`, 'VIP');
                    }
                }
            }
            vipSize--;
        }, 5000);
    }
}