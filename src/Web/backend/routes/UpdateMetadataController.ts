import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import App from '../server';

class UpdateMetadataController extends RouteStructure {
    constructor(app: App) {
        super(app);
    }

    run = async (req: Request, res: Response) => {
        try {
            const userId = req.body.userId;
            await this.app.updateMetadata(userId);

            res.status(204);
        } catch (err) {
            this.app.logger.error((err as Error).message, UpdateMetadataController.name);
            this.app.logger.warn((err as Error).stack!, UpdateMetadataController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { UpdateMetadataController };