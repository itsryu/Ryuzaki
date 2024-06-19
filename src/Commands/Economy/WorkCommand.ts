import { Message } from 'discord.js';
import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, CommandStructure } from '../../Structures/';
import { Languages } from '../../Types/ClientTypes';
import { WorkCommandData } from '../../Data/Commands/Economy/WorkCommandData';

export default class WorkCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, WorkCommandData);
    }

    public async commandExecute({ message, language }: { message: Message, language: Languages }) {
        const userData = await this.client.getData(message.author.id, 'user');

        if (!userData) {
            return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
        } else {
            //================= Importações =================/

            const money = this.client.utils.randomIntFromInterval(1000, 5000);
            const extraMoney = this.client.utils.randomIntFromInterval(5000, 20000);
            const totalReceived = userData.vip.status ? money + extraMoney : money;
            const atual = userData.economy.coins;
            const work = userData.economy.work;
            const cooldown = 60000 * 60 * 12 - (Date.now() - work);

            const embed = new ClientEmbed(this.client)
                .setAuthor({ name: 'Trabalho!', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                .setDescription(`Você trabalhou e conseguiu: ${userData.vip.status ? `\n**${money.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${this.client.utils.toAbbrev(money)} + R$ ${this.client.utils.toAbbrev(extraMoney)}) (VIP)!` : `\n**${totalReceived.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${this.client.utils.toAbbrev(totalReceived)})!`}`)
                .setFooter({ text: 'Trabalhe novamente:' })
                .setTimestamp(Date.now() + 60000 * 60 * 12);

            const reedemed = new ClientEmbed(this.client)
                .setAuthor({ name: 'Trabalho!', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                .setDescription(`${message.author}, você já trabalhou hoje!\n\nTrabalhe novamente em: ||<t:${Math.floor((Date.now() + cooldown) / 1000)}:f> (<t:${Math.floor((Date.now() + cooldown) / 1000)}:R>)||`);

            if (work !== null && cooldown > 0) {
                return void message.reply({ embeds: [reedemed] });
            } else {
                userData.set({
                    'economy.coins': totalReceived + atual,
                    'economy.work': Date.now()
                });
                await userData.save();

                return void message.reply({ embeds: [embed] });
            }
        }
    }
}