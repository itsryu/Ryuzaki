import { NextFunction, Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import { Logger } from '../../../Utils/logger';

class AuthMiddleware extends RouteStructure {
    run = (req: Request, res: Response, next: NextFunction) => {
        const auth = req.headers.authorization;
        const [bearer, token] = auth?.length ? (auth.split(' ')) : ['Bearer', ''];

        try {
            if (bearer !== 'Bearer' || !token) {
                return void res.status(400).json(new JSONResponse(400, 'Bad Request').toJSON());
            } else if (token !== process.env.AUTH_KEY) {
                Logger.warn(`Invalid authorization key used: ${token}`, AuthMiddleware.name);
                return void res.status(401).json(new JSONResponse(401, 'Unauthorized').toJSON());
            } else {
                Logger.info(`Valid authorization key used: ${token}`, AuthMiddleware.name);
                next();
            }
        } catch (err) {
            Logger.error((err as Error).message, AuthMiddleware.name);
            Logger.warn((err as Error).stack, AuthMiddleware.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { AuthMiddleware };