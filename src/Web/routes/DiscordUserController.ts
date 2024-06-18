import { Request, Response } from 'express';
import App from '../server';
import { JSONResponse, RouteStructure } from '../../Structures/RouteStructure';
import { NextFunction } from 'express-serve-static-core';
import { Snowflake } from 'discord-api-types/v10';
import { DiscordUser } from '../../Types/GatewayTypes';
import axios, { AxiosError } from 'axios';

class DiscordUserController extends RouteStructure {
    constructor(app: App) {
        super(app);
    }

    run = async (req: Request, res: Response, _: NextFunction) => {
        try {
            const id = req.params.id;

            if (!id) {
                return res.status(400).json(new JSONResponse(400, 'Bad Request').toJSON());
            } else {
                const user = await this.getUser(req.params.id);

                if (!user) {
                    return res.status(404).json(new JSONResponse(404, 'User not found').toJSON());
                } else {
                    return res.status(200).json(user);
                }
            }
        } catch (err) {
            this.app.logger.error((err as Error).message, DiscordUserController.name);
            this.app.logger.warn((err as Error).stack as string, DiscordUserController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };

    private getUser = async (id: Snowflake): Promise<DiscordUser | null> => {
        const fetchUser = async (resolve: any) => {
            try {
                const response = await axios.get(process.env.DISCORD_API + '/' + id + '/' + 'profile', {
                    headers: {
                        Authorization: process.env.USER_TOKEN
                    }
                });

                resolve(response.data);
            } catch (err) {
                if ((err as AxiosError).response) {
                    this.app.logger.error(`Error while fetching user profile: ${(err as AxiosError).response?.status} ${(err as AxiosError).response?.statusText} - ${(err as AxiosError).response?.data}`, 'Gateway Message');
                } else if ((err as AxiosError).request) {
                    this.app.logger.error('Error while fetching user profile: No response received', 'Gateway Message');
                } else {
                    this.app.logger.error(`Error while fetching user profile: ${(err as AxiosError).message}`, 'Gateway Message');
                }

                
                resolve(null);
            }
        };

        return await new Promise<DiscordUser | null>(fetchUser);
    };
}

export { DiscordUserController }