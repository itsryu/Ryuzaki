import { WebhookPayload } from '@top-gg/sdk';
import { NextFunction, Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import { EmbedBuilder } from 'discord.js';
import { Abbrev } from '../../../Utils/abbrev';
import { Logger } from '../../../Utils/logger';
import { Util } from '../../../Utils/util';

class DBLController extends RouteStructure {
    run = async (_: Request, res: Response, __: NextFunction, vote: WebhookPayload) => {
        try {
            const user = await this.app.client.users.fetch(vote.user);
            const userData = await this.app.client.getData(user?.id, 'user');
            const addedMoney = Util.randomValueFromInterval(5000, 10000);

            if (!user || !userData) {
                return void res.status(404).json(new JSONResponse(404, 'User not found').toJSON());
            } else {
                try {
                    const money = userData.economy.coins;
                    const votes = userData.economy.votes;

                    userData.set({
                        'economy.coins': money + addedMoney,
                        'economy.votes': votes + 1,
                        'economy.vote': Date.now()
                    });

                    await userData.save();

                    if (userData.economy.votes % 40 === 0) {
                        // TODO: Criar surpresa especial: 
                    } else {
                        const votedEmbed = new EmbedBuilder()
                            .setColor(0xF1F1F1)
                            .setAuthor({ name: this.app.client.t('main:vote:embeds:voted.title'), iconURL: user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setDescription(this.app.client.t('main:vote:embeds:voted.description', { user, votes, money: addedMoney.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), abbrevMoney: new Abbrev(addedMoney).toString() }));

                        user?.send({ embeds: [votedEmbed] })
                            .then((message) => message.react('🥰'))
                            .catch(() => false);
                    }
                } catch (err) {
                    Logger.error((err as Error).message, DBLController.name);
                    Logger.warn((err as Error).stack, DBLController.name);
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, DBLController.name);
            Logger.warn((err as Error).stack, DBLController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { DBLController };