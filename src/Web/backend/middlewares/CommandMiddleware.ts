import { NextFunction, Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import { Ryuzaki } from '../../../RyuzakiClient';

class CommandMiddleware extends RouteStructure {
    run = (req: Request, res: Response, next: NextFunction, client: Ryuzaki) => {
        try {
            const commandName = req.params.name;
            const command = client.commands.get(commandName);

            if (command) {
                this.app.logger.info(`\nCommand executed successfully:\nCommand name: ${command.data.options.name}\nCommand description: ${command.data.options.description}`, CommandMiddleware.name);
                next();
            } else {
                this.app.logger.warn(`\nTried to execute a nonexistent command:\nCommand name: ${commandName}`, CommandMiddleware.name);
                return void res.status(404).json(new JSONResponse(404, 'Command not found').toJSON());
            }
        } catch (err) {
            this.app.logger.error((err as Error).message, CommandMiddleware.name);
            this.app.logger.warn((err as Error).stack, CommandMiddleware.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { CommandMiddleware };