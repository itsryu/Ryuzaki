import { Snowflake } from 'discord.js';
import { DiscordUser } from '../types/gatewayTypes';
import { UserBadges, UserFlagKey } from './Objects/flags';
import { Logger } from './logger';

interface UserBoostBadge {
    atualBadge?: string | null;
    atualBadgeTime?: number;
    nextBadge?: string;
    nextBadgeTime?: number;
};

export class GetDiscordUserApiData {
    public static async getUserData(userId: Snowflake): Promise<DiscordUser | undefined> {
        try {
            const data = await fetch((process.env.STATE === 'development' ? (process.env.LOCAL_URL + ':' + process.env.PORT) : (process.env.DOMAIN_URL)) + ('/discord/user/' + userId), {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + process.env.AUTH_KEY
                }
            })
                .then((res) => res.json())
                .catch(() => undefined) as DiscordUser | undefined;

            if (data) return data;
            else return undefined;
        } catch (err) {
            Logger.error((err as Error).message, [GetDiscordUserApiData.name, GetDiscordUserApiData.getUserData.name]);
            Logger.warn((err as Error).stack, [GetDiscordUserApiData.name, GetDiscordUserApiData.getUserData.name]);
            return undefined;
        }
    }

    public static getUserBadges(user: DiscordUser | undefined) {
        const badges = user?.badges;

        if (badges) {
            return Object.entries(UserBadges)
                .map(([badge, emoji]) => badges.map((b) => b.id).includes(badge as UserFlagKey) ? emoji : null)
                .filter(emoji => emoji !== null);
        } else {
            return [];
        }
    }

    public static getUserBoostBadge(user: DiscordUser | undefined): UserBoostBadge | undefined {
        const atualBoostDate = user?.premium_guild_since;

        if (atualBoostDate) {
            const atualBoostTimeMs = new Date(atualBoostDate).getTime();
            const calculatedAtualBoostTime = Math.abs(Date.now() - atualBoostTimeMs);
            const avarageMonth = 365 / 12;

            switch (true) {
                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * avarageMonth * 1): {
                    return {
                        atualBadge: '<:1Month:1252302212559015986>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:2Months:1252302325918335109>',
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * avarageMonth * 1))
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * avarageMonth * 2): {
                    return {
                        atualBadge: '<:2Months:1252302325918335109>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:3Months:1252302405572362466>',
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * avarageMonth * 2))
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * avarageMonth * 3): {
                    return {
                        atualBadge: '<:3Months:1252302405572362466>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:6Months:1252346325136314489>',
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * avarageMonth * 3))
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * avarageMonth * 6): {
                    return {
                        atualBadge: '<:6Months:1252346325136314489>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:9Months:1252346547996196937>',
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * avarageMonth * 9))
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * avarageMonth * 12): {
                    return {
                        atualBadge: '<:9Months:1252346547996196937>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:12Months:1252346695547752478>',
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * avarageMonth * 12))
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * avarageMonth * 18): {
                    return {
                        atualBadge: '<:12Months:1252346695547752478>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:18Months:1252346969355980820>',
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * avarageMonth * 18))
                    };
                }

                case calculatedAtualBoostTime < (1000 * 60 * 60 * 24 * avarageMonth * 24): {
                    return {
                        atualBadge: '<:18Months:1252346969355980820>',
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: '<:24Months:1252347148381589574>',
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (1000 * 60 * 60 * 24 * avarageMonth * 24))
                    };
                }

                case calculatedAtualBoostTime > (1000 * 60 * 60 * 24 * avarageMonth * 24): {
                    return {
                        atualBadge: '<:24Months:1252347148381589574>',
                        atualBadgeTime: calculatedAtualBoostTime
                    };
                }

                default: {
                    return {};
                }
            }
        } else {
            return undefined;
        }
    }
}