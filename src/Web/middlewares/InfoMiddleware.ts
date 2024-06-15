import { NextFunction, Request, Response } from 'express';
import { RouteStructure } from '../../Structures/RouteStructure';
import App from '../server';

class InfoMiddleware extends RouteStructure {
    constructor(app: App) {
        super(app);
    }

    run = (req: Request, _: Response, next: NextFunction) => {
        const ip = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? req.connection.remoteAddress;

        this.app.logger.info(`\nRoute: ${req.originalUrl}\nMethod: ${req.method}\nIP: ${ip}`, InfoMiddleware.name);

        return next();
    };
}

export { InfoMiddleware };