import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { Ryuzaki } from '../../ryuzakiClient';
import { ClientEmbed, CommandStructure } from '../../Structures/';
import { Languages } from '../../types/clientTypes';
import { emojis } from '../../Utils/Objects/emojis';
import { BagCommandData } from '../../data/commands/Economy/BagCommandData';
import { Abbrev } from '../../Utils/abbrev';
import { Logger } from '../../Utils/logger';

export default class BagCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, BagCommandData);
    }

    public async commandExecute({ message, args, language }: { message: OmitPartialGroupDMChannel<Message>, args: string[], language: Languages }) {
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
                            value: `\`${coins.toLocaleString(language, { style: 'currency', currency: 'BRL' })}\` \`(R$ ${new Abbrev(coins).toString()})\``
                        },
                        {
                            name: `${emojis.banco} Dinheiro no banco:`,
                            value: `\`${bank.toLocaleString(language, { style: 'currency', currency: 'BRL' })}\` \`(R$ ${new Abbrev(bank).toString()})\``
                        },
                        {
                            name: `${emojis.economia} Total`,
                            value: `\`${(coins + bank).toLocaleString(language, { style: 'currency', currency: 'BRL' })}\` \`(R$ ${new Abbrev(coins + bank).toString()})\``
                        }
                    );

                return void await message.reply({ embeds: [carteira] });
            }
        } catch (err) {
            Logger.error((err as Error).message, BagCommand.name);
            Logger.warn((err as Error).stack, BagCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}