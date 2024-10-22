import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { StealCommandData } from '../../data/commands/Economy/StealCommandData';
import { Languages } from '../../types/clientTypes';
import { Abbrev } from '../../Utils/abbrev';
import { Logger } from '../../Utils/logger';

export default class StealCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, StealCommandData);
    }

    public async commandExecute({ message, args, language }: { message: OmitPartialGroupDMChannel<Message>, args: string[], language: Languages }) {
        try {
            const member = message.mentions?.members?.first() ?? message.guild?.members.cache.get(args[0]);
            const userData = await this.client.getData(message.author.id, 'user');

            if (!userData) {
                return void await message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else if (!member) {
                return void await message.reply({ content: 'Você deve `mencionar um usuário ou inserir o ID` para rouba-lo.' });
            } else if (member.user.bot) {
                return void await message.reply({ content: 'Você não pode roubar um BOT.' });
            } else if (message.author.id === member.id) {
                return void await message.reply({ content: 'Você não pode roubar a si mesmo.' });
            } else if (userData.exp.level < 5) {
                return void await message.reply({ content: 'Você precisa ser `nível 5` ou superior para roubar alguém.' });
            } else {
                const target = await this.client.getData(member.id, 'user');
                const time = userData.steal.time;
                const cooldown = (1000 * 60 * 30) - (Date.now() - time);

                if (!target) {
                    return void await message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
                } else if (target.economy.coins < 1000) {
                    return void await message.reply({ content: 'Este usuário não possui dinheiro suficiente para ser roubado.' });
                } else if (target.steal.protection > Date.now()) {
                    return void await message.reply({ content: 'Este usuário está protegido contra roubos.' });
                } else {
                    if (time && cooldown > 0) {
                        const embed = new ClientEmbed(this.client)
                            .setAuthor({ name: `${message.author.username} tentou roubar ${member.user.username}`, iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                            .setDescription(`Você já roubou alguém hoje!\n\nTente novamente em: ||<t:${Math.floor((Date.now() + cooldown) / 1000)}:f> (<t:${Math.floor((Date.now() + cooldown) / 1000)}:R>)||`);

                        return void await message.reply({ embeds: [embed] });
                    } else {
                        const chance = Math.floor(Math.random() * 100) + 1;

                        if (chance >= 50) {
                            const receivedExp = Math.floor(Math.random() * 20) + 1;

                            const money = Math.floor(Math.random() * target.economy.coins) + 1;

                            userData.set({
                                'economy.coins': userData.economy.coins + money,
                                'steal.time': Date.now(),
                                'exp.xp': userData.exp.xp + receivedExp
                            });
                            await userData.save();

                            target.set({
                                'economy.coins': target.economy.coins - money
                            });
                            await target.save();

                            const embed = new ClientEmbed(this.client)
                                .setAuthor({ name: `${message.author.username} roubou ${member.user.username}`, iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                .setDescription(`Você roubou **${money.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${new Abbrev(money).toString()}) de ${member}! \n\nVocê também recebeu: **${receivedExp}** de experiência.`);

                            return void await message.reply({ embeds: [embed] });
                        } else {
                            const removedExp = Math.floor(Math.random() * 20) + 1;

                            const embed = new ClientEmbed(this.client)
                                .setAuthor({ name: `${message.author.username} tentou roubar ${member.user.username}`, iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                .setDescription(`Você falhou ao tentar roubar ${member}! Perdeu ${removedExp} de experiência.`);

                            userData.set({
                                'steal.time': Date.now(),
                                'exp.xp': userData.exp.xp - removedExp
                            });
                            await userData.save();

                            return void await message.reply({ embeds: [embed] });
                        }
                    }
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, StealCommand.name);
            Logger.warn((err as Error).stack, StealCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}