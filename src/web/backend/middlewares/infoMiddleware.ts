import { NextFunction, Request, Response } from 'express';
import { RouteStructure } from '../../../structures';
import { Logger } from '../../../utils/logger';

class InfoMiddleware extends RouteStructure {
    run = (req: Request, _: Response, next: NextFunction) => {
        const ip = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? req.connection.remoteAddress;

        Logger.info(`\nRoute: ${req.originalUrl}\nMethod: ${req.method}\nIP: ${ip as string}`, InfoMiddleware.name);

        next();
    };
}

export { InfoMiddleware };