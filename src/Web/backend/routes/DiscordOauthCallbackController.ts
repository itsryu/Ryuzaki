import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import App from '../server';

class DiscordOauthCallbackController extends RouteStructure {
    constructor(app: App) {
        super(app);
    }

    run = async (req: Request, res: Response) => {
        try {
            const code = req.query.code;
            const discordState = req.query.state;
            const { clientState } = req.signedCookies;

            if (clientState !== discordState) {
                console.error('State verification failed.');
                return res.status(403).json(new JSONResponse(403, 'Forbidden').toJSON());
            } else {
                const tokens = await this.app.getOAuthTokens(code);
                const meData = await this.app.getUserData(tokens);

                if (meData) {
                    const userId = meData.id;

                    await this.app.storeDiscordTokens(userId, {
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                        expires_in: Date.now() + tokens.expires_in * 1000,
                        scope: tokens.scope,
                        token_type: tokens.token_type
                    });

                    await this.app.updateMetadata(userId);

                    res.status(200).json(new JSONResponse(200, 'OK').toJSON());
                }
            }
        } catch (err) {
            this.app.logger.error((err as Error).message, DiscordOauthCallbackController.name);
            this.app.logger.warn((err as Error).stack!, DiscordOauthCallbackController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { DiscordOauthCallbackController };