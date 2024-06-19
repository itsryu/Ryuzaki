import { Request, Response } from 'express';
import App from '../server';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import { NextFunction } from 'express-serve-static-core';
import { Ryuzaki } from '../../../RyuzakiClient';

class CommandExecuteController extends RouteStructure {
    constructor(app: App) {
        super(app);
    }

    run = async (req: Request, res: Response, _: NextFunction, client: Ryuzaki) => {
        try {
            const commandName = req.params.name;
            const command = client.commands.get(commandName);

            if (command) {
                return res.status(200).json(command.data.options);
            } else {
                return res.status(404).json(new JSONResponse(404, 'Command not found').toJSON());
            }
        } catch (err) {
            this.app.logger.error((err as Error).message, CommandExecuteController.name);
            this.app.logger.warn((err as Error).stack as string, CommandExecuteController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { CommandExecuteController }