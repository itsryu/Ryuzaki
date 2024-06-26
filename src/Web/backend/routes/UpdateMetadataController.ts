import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';

class UpdateMetadataController extends RouteStructure {
    run = async (req: Request, res: Response) => {
        try {
            const userId = req.body.userId;
            await this.app.updateMetadata(userId);

            void res.status(204);
        } catch (err) {
            this.app.logger.error((err as Error).message, UpdateMetadataController.name);
            this.app.logger.warn((err as Error).stack, UpdateMetadataController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { UpdateMetadataController };