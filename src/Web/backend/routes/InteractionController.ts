import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import App from '../server';
import { InteractionResponseType, InteractionType } from 'discord-interactions';
import { NextFunction } from 'express-serve-static-core';
import { Ryuzaki } from '../../../RyuzakiClient';

class InteractionController extends RouteStructure {
    constructor(app: App) {
        super(app);
    }

    run = (req: Request, res: Response, _: NextFunction, client: Ryuzaki) => {
        try {
            const { type, data } = req.body;

            if (type === InteractionType.PING) {
                return res.send({ type: InteractionResponseType.PONG });
            }

            if (type === InteractionType.APPLICATION_COMMAND) {
                const command = client.commands.get(data.name);

                if (command) {
                    return res.status(200).json(command.data.options);
                } else {
                    return res.status(404).json(new JSONResponse(404, 'Command not found').toJSON());
                }
            }
        } catch (err) {
            this.app.logger.error((err as Error).message, InteractionController.name);
            this.app.logger.warn((err as Error).stack as string, InteractionController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { InteractionController };