import { WebhookPayload } from '@top-gg/sdk';
import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../Structures/RouteStructure';
import App from '../server';
import { NextFunction } from 'express-serve-static-core';
import { ClientEmbed } from '../../Structures';
import { Ryuzaki } from '../../RyuzakiClient';

class DBLController extends RouteStructure {
    constructor(app: App) {
        super(app);
    }

    run = async (_: Request, res: Response, __: NextFunction, vote: WebhookPayload, client: Ryuzaki) => {
        try {
            const user = await client.users.fetch(vote.user).catch(() => undefined);
            const userData = await client.getData(user?.id, 'user');
            const addedMoney = client.utils.randomIntFromInterval(2000, 5000);

            if (!userData) {
                return res.status(404).json(new JSONResponse(404, 'User not found').toJSON());
            } else {
                const money = userData.economy.coins;
                const votes = userData.economy.votes;

                await userData.set({
                    'economy.coins': money + addedMoney,
                    'economy.votes': votes + 1,
                    'economy.vote': Date.now()
                }).save();

                if (userData.economy.votes % 40 === 0) {
                    // TODO: Criar surpresa especial: 
                } else {
                    const votedEmbed = new ClientEmbed(client)
                        .setAuthor({ name: client.t('main:vote:embeds:voted.title'), iconURL: user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(client.t('main:vote:embeds:voted.description', { user, votes, money: addedMoney.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), abbrevMoney: client.utils.toAbbrev(addedMoney) }));

                    user?.send({ embeds: [votedEmbed] })
                        .then((message) => message.react('🥰'))
                        .catch(() => false);
                }
            }
        } catch (err) {
            this.app.logger.error((err as Error).message, DBLController.name);
            this.app.logger.warn((err as Error).stack as string, DBLController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { DBLController };