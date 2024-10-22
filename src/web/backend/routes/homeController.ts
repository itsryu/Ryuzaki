import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import { Logger } from '../../../Utils/logger';

class HomeController extends RouteStructure {
    run = (_: Request, res: Response) => {
        try {
            return void res.status(200).json(new JSONResponse(200, 'Hello, world!').toJSON());
        } catch (err) {
            Logger.error((err as Error).message, HomeController.name);
            Logger.warn((err as Error).stack, HomeController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { HomeController };