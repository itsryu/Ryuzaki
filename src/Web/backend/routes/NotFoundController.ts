import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';

class NotFoundController extends RouteStructure {
    run = (_: Request, res: Response) => {
        try {
            return void res.status(404).json(new JSONResponse(404, 'Not Found').toJSON());
        } catch (err) {
            this.app.logger.error((err as Error).message, NotFoundController.name);
            this.app.logger.warn((err as Error).stack, NotFoundController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { NotFoundController };