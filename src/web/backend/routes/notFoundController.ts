import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../structures';
import { Logger } from '../../../utils';

class NotFoundController extends RouteStructure {
    run = (_: Request, res: Response) => {
        try {
            return void res.status(404).json(new JSONResponse(404, 'Not Found').toJSON());
        } catch (err) {
            Logger.error((err as Error).message, NotFoundController.name);
            Logger.warn((err as Error).stack, NotFoundController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { NotFoundController };