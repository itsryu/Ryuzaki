import { Message } from 'discord.js';
import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../Structures/';
import { Languages } from '../../Types/ClientTypes';
import { DepositCommandData } from '../../Data/Commands/Economy/DepositCommandData';

export default class DepositCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, DepositCommandData);
    }

    public async commandExecute({ message, args, language }: { message: Message, args: string[], language: Languages }) {
        const userData = await this.client.getData(message.author.id, 'user');
        const amount = args[0];
        const coins = this.client.utils.notAbbrev(amount);

        if (!userData) {
            return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
        } else {

            if (['all', 'tudo'].includes(amount.toLowerCase())) {
                if (userData.economy.coins == 0) {
                    return void message.reply({ content: 'Você não possui dinheiro para depositar.' });
                } else {
                    message.reply({ content: `Você depositou **${userData.economy.coins.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${this.client.utils.toAbbrev(userData.economy.coins)}) com sucesso.` });

                    userData.set({
                        'economy.coins': 0,
                        'economy.bank': userData.economy.coins + userData.economy.bank
                    });

                    return void await userData.save();
                }
            } else if (isNaN(coins)) {
                return void message.reply({ content: 'Esta quantia é inválida. Insira um `valor válido`.' });
            } if (coins < 0) {
                return void message.reply({ content: 'Não é possível depositar menos de R$1.' });
            } else if (coins > userData.economy.coins) {
                return void message.reply({ content: 'Você não possui essa quantia para depositar.' });
            } else {
                message.reply({ content: `Você depositou **${coins.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${this.client.utils.toAbbrev(coins)}) com sucesso.` });

                userData.set({
                    'economy.coins': userData.economy.coins - coins,
                    'economy.bank': userData.economy.bank + coins
                });

                return void await userData.save();
            }
        }
    }
}