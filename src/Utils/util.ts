import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import * as winston from 'winston';
import { abbrev, convertAbbrev } from './Plugins/abbrev';
import { renderEmoji } from './Plugins/renderEmoji';
import { setTimeout as sleep } from 'timers/promises';
import { ServiceStructure } from '../Structures/';
import { SKRSContext2D } from '@napi-rs/canvas';
import { duration } from 'dayjs';
import { Language } from './Objects/flags';
import { Languages } from '../Types/ClientTypes';

enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

class Util {
    public getTime(timestamp: number | Date, language: string): string {
        const date = new Date(timestamp || Date.now());
        return new Date(date).toLocaleString(language, { timeZone: 'America/Sao_Paulo' });
    }

    public sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    public GetMention(id: string): RegExp {
        return new RegExp(`^<@!?${id}>( |)$`);
    }

    public toAbbrev(num: number) {
        return abbrev(num);
    }

    public notAbbrev(string: string) {
        return convertAbbrev(string);
    }

    public seconds_since_epoch(d: number) {
        return Math.floor(d / 1000);
    }

    public renderEmoji(ctx: SKRSContext2D, string: string, x: number, y: number) {
        return renderEmoji(ctx, string, x, y);
    }

    public randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    public zeroFill(num: number) {
        return ('0' + num).slice(-2);
    }

    public counter(num: number): string {
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
        return num
            .toString()
            .split('')
            .map((n) => numbers[parseInt(n)])
            .join('');
    }


    public trim(str: string, max: number) {
        return str.length > max ? `${str.slice(0, max - 3)}...` : str;
    }

    public validate(color: string): boolean {
        return /^[0-9A-F]{3}([0-9A-F]{3})?([0-9A-F]{2})?$/i.test(color.replace('#', ''));
    }

    public bytesToSize(input: number, precision?: number): string {
        const index = Math.floor(Math.log(input) / Math.log(1024));
        const unit = ['', 'K', 'M', 'G', 'T', 'P'];
        return (index >= unit.length ? input + 'B' : `${(input / 1024 ** index).toFixed(precision ?? 2)} ${unit[index]}B`);
    }

    public clean(string: unknown): string {
        return typeof string === 'string' ? string.replace(/[`@]/g, c => `${c}\u200B`) : String(string);
    }

    public button(num = 1, first = false, second = false) {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('-')
                    .setLabel('👈')
                    .setDisabled(first)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('page')
                    .setLabel(`Pag: ${num}`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('+')
                    .setLabel('👉')
                    .setDisabled(second)
                    .setStyle(ButtonStyle.Secondary)
            );
    }

    public async executeService(service: ServiceStructure) {
        const { amount = 1, interval = 0, wait = 0 } = service.data;

        for (let i = 0; i < amount; i++) {
            await sleep(wait);
            service.serviceExecute();
            if (i < amount - 1) {
                await sleep(interval);
            }
        }
    }

    public checkDays(date: Date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / 86400000);

        return days + (days == 1 ? ' dia' : ' dias') + ' atrás';
    }

    public static formatDuration(ms: number, language: Languages): string {
        const timeDuration = duration(ms);

        const arrays: Record<Language, [number, string[]][]> = { 
            'pt-BR': [
                [timeDuration.years(), ['ano', 'anos']],
                [timeDuration.months(), ['mês', 'meses']],
                [timeDuration.days(), ['dia', 'dias']],
                [timeDuration.hours(), ['hora', 'horas']],
                [timeDuration.minutes(), ['minuto', 'minutos']],
                [timeDuration.seconds(), ['segundo', 'segundos']],
            ],
            'en-US': [
                [timeDuration.years(), ['year', 'years']],
                [timeDuration.months(), ['month', 'months']],
                [timeDuration.days(), ['day', 'days']],
                [timeDuration.hours(), ['hour', 'hours']],
                [timeDuration.minutes(), ['minute', 'minutes']],
                [timeDuration.seconds(), ['second', 'seconds']],
            ]
        };

        const components = arrays[language];

        const result = components
            .filter(([value]) => value > 0)
            .map(([value, label]) => `${value} ${label[value === 1 ? 0 : 1]}`)
            .join(', ');

        const lastCommaIndex = result.lastIndexOf(', ');

        if (lastCommaIndex !== -1) {
            return result.slice(0, lastCommaIndex) + ' e' + result.slice(lastCommaIndex + 1);
        }

        return result;
    }
}

class Logger {
    private logger: winston.Logger;

    constructor(private level: LogLevel = LogLevel.INFO, private environment: string = process.env.STATE) {
        this.logger = winston.createLogger({
            level: this.level,
            defaultMeta: { environment: this.environment },
            transports: [
                new winston.transports.Console()
            ],
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                winston.format.json(),
                winston.format.colorize({
                    colors: {
                        error: 'red',
                        warn: 'yellow',
                        info: 'green',
                        debug: 'blue'
                    }
                }),
                winston.format.printf((info) => {
                    const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                    return `[${timestamp}] [${info.level}] [${info.environment}] [${info.path}] ${info.message}`;
                })
            )
        });
    }

    public debug(message: string, meta: any): void {
        this.logger.debug(message, { path: meta });
    }

    public info(message: string, meta: any): void {
        this.logger.info(message, { path: meta });
    }

    public warn(message: string, meta: any): void {
        this.logger.warn(message, { path: meta });
    }

    public error(message: string, meta: any): void {
        this.logger.error(message, { path: meta });
    }
}


export { Util, Logger };