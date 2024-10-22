import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { Ryuzaki } from '../../ryuzakiClient';
import { ClientEmbed, CommandStructure } from '../../Structures/';
import { Languages } from '../../types/clientTypes';
import { WorkCommandData } from '../../Data/Commands/Economy/WorkCommandData';
import { Abbrev } from '../../Utils/abbrev';
import { Logger } from '../../Utils/logger';
import { Util } from '../../Utils/util';

export default class WorkCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, WorkCommandData);
    }

    public async commandExecute({ message, language }: { message: OmitPartialGroupDMChannel<Message>, language: Languages }) {
        try {
            const userData = await this.client.getData(message.author.id, 'user');

            if (!userData) {
                return void await message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {
                //================= Importações =================/

                const money = Util.randomValueFromInterval(1000, 5000);
                const extraMoney = Util.randomValueFromInterval(5000, 20000);
                const totalReceived = userData.vip.status ? money + extraMoney : money;
                const atual = userData.economy.coins;
                const work = userData.economy.work;
                const cooldown = (1000 * 60 * 60 * 12) - (Date.now() - work);

                if (work && cooldown > 0) {
                    const reedemed = new ClientEmbed(this.client)
                        .setAuthor({ name: 'Trabalho!', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(`${message.author}, você já trabalhou hoje!\n\nTrabalhe novamente em: ||<t:${Math.floor((Date.now() + cooldown) / 1000)}:f> (<t:${Math.floor((Date.now() + cooldown) / 1000)}:R>)||`);


                    return void await message.reply({ embeds: [reedemed] });
                } else {
                    const userExp = userData.exp.xp;
                    const receivedExp = Math.floor(Math.random() * 20) + 1;

                    const embed = new ClientEmbed(this.client)
                        .setAuthor({ name: 'Trabalho!', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(`Você trabalhou e conseguiu: ${userData.vip.status ? `\n**${money.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${new Abbrev(money).toString()} + R$ ${new Abbrev(extraMoney).toString()}) (VIP)!` : `\n**${totalReceived.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${new Abbrev(totalReceived).toString()})! \n\nVocê também recebeu: \n**${receivedExp}** de experiência!`}`)
                        .setFooter({ text: 'Trabalhe novamente:' })
                        .setTimestamp(Date.now() + 60000 * 60 * 12);

                    userData.set({
                        'economy.coins': totalReceived + atual,
                        'economy.work': Date.now(),
                        'exp.xp': userExp + receivedExp
                    });
                    await userData.save();

                    return void await message.reply({ embeds: [embed] });
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, WorkCommand.name);
            Logger.warn((err as Error).stack, WorkCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}