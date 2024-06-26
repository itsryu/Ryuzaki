import { NextFunction, Request, Response } from 'express';
import { RouteStructure } from '../../../Structures/RouteStructure';

class InfoMiddleware extends RouteStructure {
    run = (req: Request, _: Response, next: NextFunction) => {
        const ip = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? req.connection.remoteAddress;

        this.app.logger.info(`\nRoute: ${req.originalUrl}\nMethod: ${req.method}\nIP: ${ip as string}`, InfoMiddleware.name);

        next();
    };
}

export { InfoMiddleware };