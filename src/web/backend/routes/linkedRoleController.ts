import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import { Logger } from '../../../Utils/logger';

class LinkedRoleController extends RouteStructure {
    run = (_: Request, res: Response) => {
        try {
            const { url, state } = this.app.getOAuthUrl();

            res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: true });

            res.redirect(url);
        } catch (err) {
            Logger.error((err as Error).message, LinkedRoleController.name);
            Logger.warn((err as Error).stack, LinkedRoleController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { LinkedRoleController };