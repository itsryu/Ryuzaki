import { Message, MessageReaction, User } from 'discord.js';
import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure } from '../../Structures/';
import { Languages } from '../../Types/ClientTypes';
import { PayCommandData } from '../../Data/Commands/Economy/PayCommandData';

export default class PayCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, PayCommandData);
    }

    public async commandExecute({ message, args, language }: { message: Message, args: string[], language: Languages }) {
        try {
            const member = message.mentions.members?.first() ?? message.guild?.members.cache.get(args[0]);
            const amount = args[1];
            const userData = await this.client.getData(message.author.id, 'user');

            if (!userData) {
                return void await message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else if (!member) {
                return void await message.reply({ content: 'Você deve `mencionar um usuário ou inserir o ID` para enviar uma determinada quantia de dinheiro.' });
            } else if (member.user.bot) {
                return void await message.reply({ content: 'Você não pode enviar dinheiro para um BOT.' });
            } else if (!amount) {
                return void await message.reply({ content: 'Você deve inserir a quantia que deseja enviar.' });
            } else {
                const money = this.client.utils.notAbbrev(amount);

                if (isNaN(money)) {
                    return void await message.reply({ content: 'Esta quantia é inválida. Insira um `valor válido`.' });
                } else if (money <= 0) {
                    return void await message.reply({ content: 'Esta quantia é invalida, pois é menor ou igual a 0. Insira um \`valor válido\`.' });
                } else if (member.id === message.author.id) {
                    return void await message.reply({ content: 'Você não pode enviar o seu dinheiro para si mesmo.' });
                } else if (money > userData.economy.bank) {
                    return void await message.reply({ content: 'Você não possui a quantia especificada.' });
                } else {
                    const target = await this.client.getData(member.id, 'user');

                    if (!target) {
                        return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
                    } else {
                        const msg = await message.reply({ content: `Você deseja enviar **${money.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${this.client.utils.toAbbrev(money)}) para o(a) ${member}?!` });
                        await msg.react('✅');
                        await msg.react('❌');

                        const filter = (reaction: MessageReaction, user: User) => reaction.message.id === msg.id && user.id === message.author.id;
                        const collector = msg.createReactionCollector({ filter, time: 60000, max: 1 });

                        collector.on('end', async () => {
                            await msg.reactions.removeAll();
                        });

                        collector.on('collect', async (reaction) => {
                            if (reaction.emoji.name === '✅') {
                                userData.set({
                                    'economy.bank': userData.economy.bank - money
                                });
                                await userData.save();

                                target.set({
                                    'economy.bank': target.economy.bank + money
                                });
                                await target.save();

                                return void await msg.edit({ content: `Você enviou **${money.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${this.client.utils.toAbbrev(money)}) com sucesso para o(a) ${member}.` });
                            }

                            if (reaction.emoji.name === '❌') {
                                return void await msg.edit({ content: `${message.author}, envio de dinheiro cancelado.` });
                            }
                        });
                    }
                }
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, PayCommand.name);
            this.client.logger.warn((err as Error).stack, PayCommand.name);
        }
    }
}