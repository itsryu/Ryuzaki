import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';

class HomeController extends RouteStructure {
    run = (_: Request, res: Response) => {
        try {
            const { url, state } = this.app.getOAuthUrl();

            res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: true });

            res.redirect(url);
        } catch (err) {
            this.app.logger.error((err as Error).message, HomeController.name);
            this.app.logger.warn((err as Error).stack, HomeController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { HomeController };