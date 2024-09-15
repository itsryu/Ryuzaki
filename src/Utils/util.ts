import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { renderEmoji } from './Plugins/renderEmoji';
import { SKRSContext2D } from '@napi-rs/canvas';
import { duration } from 'dayjs';
import { Language } from './Objects/flags';
import { Languages } from '../Types/ClientTypes';

namespace Util {
    export type timezone = 'America/Sao_Paulo' | 'America/New_York' | 'America/Los_Angeles' | 'America/Chicago' | 'America/Denver' | 'America/Phoenix' | 'America/Anchorage' | 'America/Adak' | 'Pacific/Honolulu';

    /**
     * Returns the formatted time based on the given timestamp, language, and timeZone.
     * 
     * @param timestamp - The timestamp to format. If not provided, the current timestamp will be used.
     * @param language - The language used for formatting the time.
     * @param timeZone - The timeZone used for formatting the time.
     * @returns The formatted time as a string.
     */
    export function getTime(timestamp: number | Date, language: Languages, timeZone: Util.timezone): string {
        const date = new Date(timestamp || Date.now());
        return new Date(date).toLocaleString(language, { timeZone });
    }

    /**
     * Checks if a string is a mention of a user.
     * 
     * @param id - The ID of the user to check for mention.
     * @returns A regular expression that matches the mention format.
     */
    export function isMention(id: string): RegExp {
        return new RegExp(`^<@!?${id}>( |)$`);
    }

    /**
     * Renders emojis on the canvas context.
     * 
     * @param ctx - The canvas 2D rendering context.
     * @param string - The string containing emojis to be rendered.
     * @param x - The x-coordinate of the starting position.
     * @param y - The y-coordinate of the starting position.
     * @returns A promise that resolves when the emojis are rendered.
     */
    export function renderEmojis(ctx: SKRSContext2D, string: string, x: number, y: number): Promise<void> {
        return renderEmoji(ctx, string, x, y);
    }

    /**
     * Generates a random value from the specified interval.
     * 
     * @param minValue - The minimum value of the interval.
     * @param maxValue - The maximum value of the interval.
     * @returns A random value within the specified interval.
     */
    export function randomValueFromInterval(minValue: number, maxValue: number) {
        return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
    }

    /**
     * Converts a number into a string representation using emoji numbers.
     * 
     * @param num - The number to convert.
     * @returns The string representation of the number using emoji numbers.
     */
    export function counter(number: number): string {
        const numbers: Record<number, string> = {
            0: '0️⃣',
            1: '1️⃣',
            2: '2️⃣',
            3: '3️⃣',
            4: '4️⃣',
            5: '5️⃣',
            6: '6️⃣',
            7: '7️⃣',
            8: '8️⃣',
            9: '9️⃣'
        };

        return number
            .toString()
            .split('')
            .map((n) => numbers[parseInt(n)])
            .join('');
    }

    /**
     * Trims a string to a specified maximum length.
     * If the string is longer than the maximum length, it will be truncated and "..." will be appended.
     * 
     * @param string - The string to be trimmed.
     * @param maxLength - The maximum length of the trimmed string.
     * @returns The trimmed string.
     */
    export function trim(string: string, maxLength: number): string {
        return string.length > maxLength ? `${string.slice(0, maxLength - 3)}...` : string;
    }

    /**
     * Cleans a string by replacing backticks and at symbols with a zero-width space.
     * 
     * @param string - The string to be cleaned.
     * @returns The cleaned string.
     */
    export function clean(string: string): string {
        return typeof string === 'string' ? string.replace(/[`@]/g, c => `${c}\u200B`) : String(string);
    }

    /**
     * Creates a button action row with three buttons.
     * 
     * @param pageNumber - The page number to display on the middle button.
     * @param isFirstDisabled - Indicates whether the first button should be disabled.
     * @param isSecondDisabled - Indicates whether the second button should be disabled.
     * @returns An ActionRowBuilder instance with three buttons.
     */
    export function button(pageNumber: number, isFirstDisabled: boolean, isSecondDisabled: boolean): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('-')
                    .setLabel('👈')
                    .setDisabled(isFirstDisabled)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('page')
                    .setLabel(`Pag: ${pageNumber.toString()}`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('+')
                    .setLabel('👉')
                    .setDisabled(isSecondDisabled)
                    .setStyle(ButtonStyle.Secondary)
            );
    }

    /**
     * Calculates the next level experience based on the current level.
     * 
     * @param level - The current level.
     * @returns The next level experience.
     */
    export function nextLevelExp(level: number): number {
        const baseXP = 100;
        const multiplier = 1.5;

        return Math.floor(baseXP * Math.pow(level, multiplier));
    }

    /**
     * Formats the duration in milliseconds into a human-readable string.
     * 
     * @param milliseconds - The duration in milliseconds.
     * @param language - The language to use for formatting the duration.
     * @param format - Optional. An array of format strings to include in the result.
     * @returns The formatted duration as a string.
     */
    export function formatDuration(milliseconds: number, language: Languages, format?: string[]): string {
        const timeDuration = duration(milliseconds);

        const arrays: Record<Language, [number, string[]][]> | [] = {
            'pt-BR': [
                [timeDuration.years(), ['ano', 'anos']],
                [timeDuration.months(), ['mês', 'meses']],
                [timeDuration.days(), ['dia', 'dias']],
                [timeDuration.hours(), ['hora', 'horas']],
                [timeDuration.minutes(), ['minuto', 'minutos']],
                [timeDuration.seconds(), ['segundo', 'segundos']]
            ],
            'en-US': [
                [timeDuration.years(), ['year', 'years']],
                [timeDuration.months(), ['month', 'months']],
                [timeDuration.days(), ['day', 'days']],
                [timeDuration.hours(), ['hour', 'hours']],
                [timeDuration.minutes(), ['minute', 'minutes']],
                [timeDuration.seconds(), ['second', 'seconds']]
            ]
        };

        const components: [number, string[]][] = arrays[language];

        const result = components
            .filter(([value, _]) => value > 0 && (!format || format.includes(_[0])))
            .map(([value, label]) => `${value} ${label[value === 1 ? 0 : 1]}`)
            .join(', ');

        const lastCommaIndex = result.lastIndexOf(', ');

        if (lastCommaIndex !== -1) {
            const languageSpecificConjunction = language === 'pt-BR' ? ' e' : ' and';
            return result.slice(0, lastCommaIndex) + languageSpecificConjunction + result.slice(lastCommaIndex + 1);
        }

        return result;
    }

    /**
     * Checks if a given string is a valid JSON.
     * 
     * @param string - The string to be checked.
     * @returns A boolean indicating whether the string is a valid JSON or not.
     */
    export function isJSON(string: string): boolean {
        try {
            JSON.parse(string);
            return true;
        } catch {
            return false;
        }
    }
}


export { Util };