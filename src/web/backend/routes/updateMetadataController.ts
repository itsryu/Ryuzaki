import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../structures';
import { Logger } from '../../../utils';

class UpdateMetadataController extends RouteStructure {
    run = async (req: Request, res: Response) => {
        try {
            const userId = req.body.userId;
            await this.app.updateMetadata(userId);

            void res.status(204);
        } catch (err) {
            Logger.error((err as Error).message, UpdateMetadataController.name);
            Logger.warn((err as Error).stack, UpdateMetadataController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { UpdateMetadataController };