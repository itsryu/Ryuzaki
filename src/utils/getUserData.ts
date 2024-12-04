import { Snowflake } from 'discord.js';
import { DiscordUser } from '../types/gatewayTypes';
import { UserBadges, UserFlagKey } from './objects';
import { Logger } from './index';
import { MonthBadge } from '../types';
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
            const atualBoostTimeMs = new Date(atualBoostDate).valueOf();
            const calculatedAtualBoostTime = Math.abs(Date.now() - atualBoostTimeMs) - (1 * 24 * 60 * 60 * 1000);
            const averageMonth = 365 / 12;
            const monthInMs = 1000 * 60 * 60 * 24 * averageMonth;

            switch (true) {
                case calculatedAtualBoostTime < (monthInMs * 2): {
                    return {
                        atualBadge: MonthBadge.OneMonth,
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: MonthBadge.TwoMonths,
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - monthInMs * 2)
                    };
                }

                case calculatedAtualBoostTime > (monthInMs * 2) && calculatedAtualBoostTime <= (monthInMs * 3): {
                    return {
                        atualBadge: MonthBadge.TwoMonths,
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: MonthBadge.ThreeMonths,
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (monthInMs * 3))
                    };
                }

                case calculatedAtualBoostTime > (monthInMs * 3) && calculatedAtualBoostTime <= (monthInMs * 6): {
                    return {
                        atualBadge: MonthBadge.ThreeMonths,
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: MonthBadge.SixMonths,
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (monthInMs * 6))
                    };
                }

                case calculatedAtualBoostTime > (monthInMs * 6) && calculatedAtualBoostTime <= (monthInMs * 9): {
                    return {
                        atualBadge: MonthBadge.SixMonths,
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: MonthBadge.NineMonths,
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (monthInMs * 9))
                    };
                }

                case calculatedAtualBoostTime > (monthInMs * 9) && calculatedAtualBoostTime <= (monthInMs * 12): {
                    return {
                        atualBadge: MonthBadge.NineMonths,
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: MonthBadge.TwelveMonths,
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (monthInMs * 12))
                    };
                }

                case calculatedAtualBoostTime > (monthInMs * 12) && calculatedAtualBoostTime <= (monthInMs * 15): {
                    return {
                        atualBadge: MonthBadge.TwelveMonths,
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: MonthBadge.EighteenMonths,
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (monthInMs * 15))
                    };
                }

                case calculatedAtualBoostTime > (monthInMs * 15) && calculatedAtualBoostTime <= (monthInMs * 18): {
                    return {
                        atualBadge: MonthBadge.FifthteenMonths,
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: MonthBadge.EighteenMonths,
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (monthInMs * 18))
                    };
                }

                case calculatedAtualBoostTime > (monthInMs * 18) && calculatedAtualBoostTime <= (monthInMs * 24): {
                    return {
                        atualBadge: MonthBadge.EighteenMonths,
                        atualBadgeTime: calculatedAtualBoostTime,
                        nextBadge: MonthBadge.TwentyFourMonths,
                        nextBadgeTime: Math.abs(calculatedAtualBoostTime - (monthInMs * 24))
                    };
                }

                case calculatedAtualBoostTime > (monthInMs * 24): {
                    return {
                        atualBadge: MonthBadge.TwentyFourMonths,
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

