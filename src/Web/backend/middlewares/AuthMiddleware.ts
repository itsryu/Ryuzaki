import { NextFunction, Request, Response } from 'express';
import App from '../server';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';

class AuthMiddleware extends RouteStructure {
    constructor(client: App) {
        super(client);
    }

    run = (req: Request, res: Response, next: NextFunction) => {
        const auth = req.headers['authorization'];
        const [bearer, token] = auth?.length ? (auth.split(' ')) : ['Bearer', ''];

        try {
            if (bearer !== 'Bearer' || !token) {
                return res.status(400).json(new JSONResponse(400, 'Bad Request').toJSON());
            } else if (token !== process.env.AUTH_KEY) {
                this.app.logger.warn(`Invalid authorization key used: ${token}`, AuthMiddleware.name);
                return res.status(401).json(new JSONResponse(401, 'Unauthorized').toJSON());
            } else {
                this.app.logger.info(`Valid authorization key used: ${token}`, AuthMiddleware.name);
                return next();
            }
        } catch (err) {
            this.app.logger.error((err as Error).message, AuthMiddleware.name);
            this.app.logger.warn((err as Error).stack as string, AuthMiddleware.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { AuthMiddleware };