import { Message } from 'discord.js';
import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, CommandStructure } from '../../Structures/';
import { Languages } from '../../Types/ClientTypes';
import { emojis } from '../../Utils/Objects/emojis';
import { BagCommandData } from '../../Data/Commands/Economy/BagCommandData';

export default class BagCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, BagCommandData);
    }

    public async commandExecute({ message, args, language }: { message: Message, args: string[], language: Languages }) {
        try {
            const user = message.mentions?.users?.first() ?? await this.client.users.fetch(args[0]).catch(() => undefined) ?? message.author;
            const userData = await this.client.getData(user.id, 'user');

            if (!userData) {
                return void await message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {
                const coins = userData.economy.coins;
                const bank = userData.economy.bank;

                const carteira = new ClientEmbed(this.client)
                    .setAuthor({ name: 'Carteira', iconURL: user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                    .setThumbnail(user.displayAvatarURL({ extension: 'png', size: 4096 }))
                    .addFields(
                        {
                            name: `${emojis.dinheiro} Dinheiro fora do banco:`,
                            value: `\`${coins.toLocaleString(language, { style: 'currency', currency: 'BRL' })}\` \`(R$ ${this.client.utils.toAbbrev(coins)})\``
                        },
                        {
                            name: `${emojis.banco} Dinheiro no banco:`,
                            value: `\`${bank.toLocaleString(language, { style: 'currency', currency: 'BRL' })}\` \`(R$ ${this.client.utils.toAbbrev(bank)})\``
                        },
                        {
                            name: `${emojis.economia} Total`,
                            value: `\`${(coins + bank).toLocaleString(language, { style: 'currency', currency: 'BRL' })}\` \`(R$ ${this.client.utils.toAbbrev(coins + bank)})\``
                        }
                    );

                return void await message.reply({ embeds: [carteira] });
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, BagCommand.name);
            this.client.logger.warn((err as Error).stack, BagCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}