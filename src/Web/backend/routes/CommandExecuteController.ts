import { NextFunction, Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import { Ryuzaki } from '../../../RyuzakiClient';

class CommandExecuteController extends RouteStructure {
    run = (req: Request, res: Response, _: NextFunction, client: Ryuzaki) => {
        try {
            const commandName = req.params.name;
            const command = client.commands.get(commandName);

            if (command) {
                return void res.status(200).json(command.data.options);
            } else {
                return void res.status(404).json(new JSONResponse(404, 'Command not found').toJSON());
            }
        } catch (err) {
            this.app.logger.error((err as Error).message, CommandExecuteController.name);
            this.app.logger.warn((err as Error).stack, CommandExecuteController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { CommandExecuteController };