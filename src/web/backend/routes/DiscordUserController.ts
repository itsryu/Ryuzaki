import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../../../Structures/RouteStructure';
import { Snowflake } from 'discord-api-types/v10';
import { DiscordUser } from '../../../types/gatewayTypes';
import { Logger } from '../../../Utils/logger';

class DiscordUserController extends RouteStructure {
    run = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id) {
                return void res.status(400).json(new JSONResponse(400, 'Bad Request').toJSON());
            } else {
                const user = await this.getUser(req.params.id);

                if (!user) {
                    return void res.status(404).json(new JSONResponse(404, 'User not found').toJSON());
                } else {
                    return void res.status(200).json(user);
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, DiscordUserController.name);
            Logger.warn((err as Error).stack, DiscordUserController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };

    private getUser = async (id: Snowflake): Promise<DiscordUser | null> => {
        const fetchUser = async (resolve: (value: DiscordUser | PromiseLike<DiscordUser | null> | null) => void): Promise<void> => {
            try {
                const response = await fetch(process.env.DISCORD_API + '/' + id + '/' + 'profile', {
                    headers: {
                        Authorization: process.env.USER_TOKEN,
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                });
    
                const data = await response.json() as DiscordUser;
    
                if (!response.ok) {
                    Logger.error(JSON.stringify(data), DiscordUserController.name);
                    resolve(null);
                } else {
                    resolve(data);
                }
            } catch (err) {
                Logger.error((err as Error).message, DiscordUserController.name);
                Logger.warn((err as Error).stack, DiscordUserController.name);
    
                resolve(null);
            }
        };
    
        return await new Promise<DiscordUser | null>(fetchUser);
    };
}

export { DiscordUserController };