import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../Structures/RouteStructure';
import App from '../server';

class HomeController extends RouteStructure {
    constructor(app: App) {
        super(app);
    }

    run = (_: Request, res: Response) => {
        try {
            return res.status(200).json(new JSONResponse(200, 'Hello, world!').toJSON());
        } catch (err) {
            this.app.logger.error((err as Error).message, HomeController.name);
            this.app.logger.warn((err as Error).stack as string, HomeController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { HomeController };