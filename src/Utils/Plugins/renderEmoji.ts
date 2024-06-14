import { loadImage, SKRSContext2D } from '@napi-rs/canvas';
import { parseEmoji } from 'discord.js';

export async function renderEmoji(
    ctx: SKRSContext2D,
    message: string,
    x: number,
    y: number
): Promise<void> {
    const lines = message.split('\n');
    const lineHeight = parseInt(ctx.font);

    for (const line of lines) {
        const words = line.split(' ');
        let currentLine = '';
        let currentWidth = 0;

        for (const word of words) {
            const wordWidth = ctx.measureText(word).width;

            if (currentWidth + wordWidth > ctx.canvas.width - x) {
                ctx.fillText(currentLine, x, y);
                y += lineHeight;
                currentLine = '';
                currentWidth = 0;
            }

            const characters = word.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/g);
            ctx.font = '25px KGWhattheTeacherWants';

            for (const char of characters) {
                if (/<:[a-zA-Z0-9_]+:\d+>/.test(char)) {
                    const customEmoji = parseEmoji(char);

                    if (customEmoji?.id) {
                        const link = `https://cdn.discordapp.com/emojis/${customEmoji.id}.${customEmoji.animated ? 'gif' : 'png'}`;
                        const image = await loadImage(link);

                        if (image) {
                            ctx.drawImage(image, x + currentWidth, y);
                        }
                    }
                }

                if (char.length === 2) {
                    const codePoint = char.codePointAt(0) ?? 0 - 0x10000;
                    const first = (codePoint >> 10) + 0xD800;
                    const second = (codePoint & 0x3FF) + 0xDC00;
                    const emoji = String.fromCharCode(first, second);

                    ctx.font = '25px AppleColorEmoji';
                    ctx.strokeText(emoji, x + currentWidth, y);
                    currentWidth += lineHeight;
                } else {
                    currentLine += char;
                    currentWidth += wordWidth / word.length;
                }
            }

            currentLine += ' ';
            currentWidth += ctx.measureText(' ').width;
        }

        ctx.fillText(currentLine, x, y);
        y += lineHeight;
    }
}
