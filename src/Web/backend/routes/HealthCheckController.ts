import { Request, Response } from 'express';
import App from '../server';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';

class HealthCheckController extends RouteStructure {
    constructor(app: App) {
        super(app);
    }

    run = (_: Request, res: Response) => {
        try {
            return res.status(200).json(new JSONResponse(200, 'OK').toJSON());
        } catch (err) {
            this.app.logger.error((err as Error).message, HealthCheckController.name);
            this.app.logger.warn((err as Error).stack as string, HealthCheckController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { HealthCheckController };