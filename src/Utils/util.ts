import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import * as winston from 'winston';
import { abbrev, convertAbbrev } from './Plugins/abbrev';
import { renderEmoji } from './Plugins/renderEmoji';
import { setTimeout as sleep } from 'timers/promises';
import { ServiceStructure } from '../Structures/';
import { SKRSContext2D } from '@napi-rs/canvas';

enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

class Util {
    getTime(timestamp: number | Date, language: string): string {
        const date = new Date(timestamp || Date.now());
        return new Date(date).toLocaleString(language, { timeZone: 'America/Sao_Paulo' });
    }

    sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    GetMention(id: string): RegExp {
        return new RegExp(`^<@!?${id}>( |)$`);
    }

    toAbbrev(num: number) {
        return abbrev(num);
    }

    notAbbrev(string: string) {
        return convertAbbrev(string);
    }

    seconds_since_epoch(d: number) {
        return Math.floor(d / 1000);
    }

    renderEmoji(ctx: SKRSContext2D, string: string, x: number, y: number) {
        return renderEmoji(ctx, string, x, y);
    }

    randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    zeroFill(num: number) {
        return ('0' + num).slice(-2);
    }

    counter(num: number): string {
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


    trim(str: string, max: number) {
        return str.length > max ? `${str.slice(0, max - 3)}...` : str;
    }

    validate(color: string): boolean {
        return /^[0-9A-F]{3}([0-9A-F]{3})?([0-9A-F]{2})?$/i.test(color.replace('#', ''));
    }

    bytesToSize(input: number, precision?: number): string {
        const index = Math.floor(Math.log(input) / Math.log(1024));
        const unit = ['', 'K', 'M', 'G', 'T', 'P'];
        return (index >= unit.length ? input + 'B' : `${(input / 1024 ** index).toFixed(precision ?? 2)} ${unit[index]}B`);
    }

    clean(string: unknown): string {
        return typeof string === 'string' ? string.replace(/[`@]/g, c => `${c}\u200B`) : String(string);
    }

    button(num = 1, first = false, second = false) {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('-')
                    .setLabel('👈')
                    .setDisabled(first)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('page')
                    .setLabel(`Pag: ${num}`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('+')
                    .setLabel('👉')
                    .setDisabled(second)
                    .setStyle(ButtonStyle.Success)
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

    checkDays(date: Date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / 86400000);

        return days + (days == 1 ? ' dia' : ' dias') + ' atrás';
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