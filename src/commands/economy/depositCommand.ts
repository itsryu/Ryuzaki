import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure } from '../../structures';
import { DepositCommandData } from '../../data/commands/economy/depositCommandData';
import { Abbrev, Logger } from '../../utils';
import { Language } from '../../utils/objects';

export default class DepositCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, DepositCommandData);
    }

    public async commandExecute({ message, args, language }: { message: OmitPartialGroupDMChannel<Message>, args: string[], language: Language }) {
        try {
            const userData = await this.client.getData(message.author.id, 'user');
            const amount = args[0];
            const coins = Abbrev.parse(amount);

            if (!userData) {
                return void await message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {

                if (['all', 'tudo'].includes(amount.toLowerCase())) {
                    if (userData.economy.coins == 0) {
                        return void await message.reply({ content: 'Você não possui dinheiro para depositar.' });
                    } else {
                        await message.reply({ content: `Você depositou **${userData.economy.coins.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${new Abbrev(userData.economy.coins).toString()}) com sucesso.` });

                        userData.set({
                            'economy.coins': 0,
                            'economy.bank': userData.economy.coins + userData.economy.bank
                        });

                        return void await userData.save();
                    }
                } else if (isNaN(coins)) {
                    return void await message.reply({ content: 'Esta quantia é inválida. Insira um `valor válido`.' });
                } if (coins < 0) {
                    return void await message.reply({ content: 'Não é possível depositar menos de R$1.' });
                } else if (coins > userData.economy.coins) {
                    return void await message.reply({ content: 'Você não possui essa quantia para depositar.' });
                } else {
                    await message.reply({ content: `Você depositou **${coins.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${new Abbrev(coins).toString()}) com sucesso.` });

                    userData.set({
                        'economy.coins': userData.economy.coins - coins,
                        'economy.bank': userData.economy.bank + coins
                    });

                    return void await userData.save();
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, DepositCommand.name);
            Logger.warn((err as Error).stack, DepositCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}