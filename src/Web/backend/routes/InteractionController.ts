import { NextFunction, Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import { InteractionResponseType, InteractionType } from 'discord-interactions';
import { Ryuzaki } from '../../../RyuzakiClient';

class InteractionController extends RouteStructure {
    run = (req: Request, res: Response, _: NextFunction, client: Ryuzaki) => {
        try {
            const { type, data } = req.body;

            if (type === InteractionType.PING) {
                return void res.send({ type: InteractionResponseType.PONG });
            }

            if (type === InteractionType.APPLICATION_COMMAND) {
                const command = client.commands.get(data.name);

                if (command) {
                    return void res.status(200).json(command.data.options);
                } else {
                    return void res.status(404).json(new JSONResponse(404, 'Command not found').toJSON());
                }
            }
        } catch (err) {
            this.app.logger.error((err as Error).message, InteractionController.name);
            this.app.logger.warn((err as Error).stack, InteractionController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { InteractionController };