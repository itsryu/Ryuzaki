import { Message } from 'discord.js';
import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, CommandStructure } from '../../Structures/';
import { DailyCommandData } from '../../Data/Commands/Economy/DailyCommandData';
import { Languages } from '../../Types/ClientTypes';

export default class DailyCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, DailyCommandData);
    }

    public async commandExecute({ message, language }: { message: Message, language: Languages }) {
        const userDb = await this.client.getData(message.author.id, 'user');
        const money = this.client.utils.randomIntFromInterval(1000, 5000);
        const extraMoney = this.client.utils.randomIntFromInterval(5000, 20000);
        const addedMoney = userDb.vip.status ? (money + extraMoney) : money;
        const atual = userDb.economy.coins;
        const daily = userDb.economy.daily;
        const cooldown = 60000 * 60 * 12 - (Date.now() - daily);

        const embed = new ClientEmbed(this.client)
            .setAuthor({ name: 'Recompensa diária!', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
            .setDescription(`Você resgatou a sua recompensa diária e conseguiu: ${userDb.vip.status ? `\n**${money.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${this.client.utils.toAbbrev(money)} + R$ ${this.client.utils.toAbbrev(extraMoney)}) (VIP)!` : `\n**${addedMoney.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${this.client.utils.toAbbrev(addedMoney)})!`}`)
            .setFooter({ text: 'Pegue a sua recompensa diária:' })
            .setTimestamp(Date.now() + 60000 * 60 * 12);

        const reedemed = new ClientEmbed(this.client)
            .setAuthor({ name: 'Recompensa diária!', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
            .setDescription(`${message.author}, você já resgatou a sua recompensa diária hoje!\n\nPegue-a novamente em: ||<t:${Math.floor((Date.now() + cooldown) / 1000)}:f> (<t:${Math.floor((Date.now() + cooldown) / 1000)}:R>)||`);

        //================= Verificação do tempo =================//

        if (daily !== null && cooldown > 0) {
            return void message.reply({ embeds: [reedemed] });
        } else {
            userDb.set({
                'economy.coins': atual + addedMoney,
                'economy.daily': Date.now()
            });
            userDb.save();

            return void message.reply({ embeds: [embed] });
        }
    }
}