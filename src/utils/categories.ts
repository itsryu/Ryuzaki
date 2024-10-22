import { ButtonBuilder, ButtonStyle } from 'discord.js';

const categories = [
    {
        button: new ButtonBuilder()
            .setCustomId('open')
            .setLabel('Criar ticket')
            .setEmoji('📩')
            .setStyle(ButtonStyle.Secondary)
    }
];

export { categories };