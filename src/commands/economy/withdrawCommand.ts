import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure } from '../../Structures/';
import { Languages } from '../../types/clientTypes';
import { WithdrawCommandData } from '../../data/commands/Economy/WithdrawCommandData';
import { Abbrev } from '../../Utils/abbrev';
import { Logger } from '../../Utils/logger';

export default class WithdrawCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, WithdrawCommandData);
    }

    public async commandExecute({ message, args, language }: { message: OmitPartialGroupDMChannel<Message>, args: string[], language: Languages }) {
        try {
            const userData = await this.client.getData(message.author.id, 'user');
            const amount = args[0];
            const coins = Abbrev.parse(amount);

            if (!userData) {
                return void await message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {
                if (['all', 'tudo'].includes(amount.toLowerCase())) {
                    if (userData.economy.bank == 0) {
                        return void await message.reply({ content: 'Você não possui dinheiro no banco para sacar.' });
                    } else {
                        await message.reply({ content: `Você sacou **${userData.economy.bank.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${new Abbrev(userData.economy.bank).toString()}) com sucesso.` });

                        userData.set({
                            'economy.coins': userData.economy.coins + userData.economy.bank,
                            'economy.bank': 0
                        });

                        return void await userData.save();
                    }
                } else if (amount) {
                    if (isNaN(coins)) {
                        return void await message.reply({ content: 'Esta quantia é inválida. Insira um `valor válido`.' });
                    } else if (coins < 0) {
                        return void await message.reply({ content: 'Não é possível sacar menos de R$1.' });
                    } else if (coins > userData.economy.bank) {
                        return void await message.reply({ content: 'Você não possui essa quantia para sacar.' });
                    } else {
                        await message.reply({ content: `Você sacou **${coins.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${new Abbrev(coins).toString()}) com sucesso.` });

                        userData.set({
                            'economy.coins': userData.economy.coins + coins,
                            'economy.bank': userData.economy.bank - coins
                        });

                        return void await userData.save();
                    }
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, WithdrawCommand.name);
            Logger.warn((err as Error).stack, WithdrawCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}