import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { Ryuzaki } from '../../ryuzakiClient';
import { ClientEmbed, CommandStructure } from '../../structures';
import { DailyCommandData } from '../../data/commands/economy/dailyCommandData';
import { Abbrev, Util, Logger } from '../../utils';
import { Language } from '../../utils/objects';

export default class DailyCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, DailyCommandData);
    }

    public async commandExecute({ message, language }: { message: OmitPartialGroupDMChannel<Message>, language: Language }) {
        try {
            const userData = await this.client.getData(message.author.id, 'user');
            const money = Util.randomValueFromInterval(1000, 5000);
            const extraMoney = Util.randomValueFromInterval(5000, 20000);

            if (!userData) {
                return void await message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {
                const addedMoney = userData.vip.status ? (money + extraMoney) : money;
                const atual = userData.economy.coins;
                const time = userData.economy.daily;
                const cooldown = 60000 * 60 * 12 - (Date.now() - time);

                //================= Verificação do tempo =================//

                if (time && cooldown > 0) {
                    const reedemed = new ClientEmbed(this.client)
                        .setAuthor({ name: 'Recompensa diária!', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(`${message.author}, você já resgatou a sua recompensa diária hoje!\n\nPegue-a novamente em: ||<t:${Math.floor((Date.now() + cooldown) / 1000)}:f> (<t:${Math.floor((Date.now() + cooldown) / 1000)}:R>)||`);

                    return void await message.reply({ embeds: [reedemed] });
                } else {
                    const embed = new ClientEmbed(this.client)
                        .setAuthor({ name: 'Recompensa diária!', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                        .setDescription(`Você resgatou a sua recompensa diária e conseguiu: ${userData.vip.status ? `\n**${money.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${new Abbrev(money).toString()} + R$ ${new Abbrev(extraMoney).toString()}) (VIP)!` : `\n**${addedMoney.toLocaleString(language, { style: 'currency', currency: 'BRL' })}** (R$ ${new Abbrev(addedMoney).toString()})!`}`)
                        .setFooter({ text: 'Pegue a sua recompensa diária:' })
                        .setTimestamp(Date.now() + 60000 * 60 * 12);


                    userData.set({
                        'economy.coins': atual + addedMoney,
                        'economy.daily': Date.now(),
                        'exp.xp': userData.exp.xp + 10
                    });
                    await userData.save();

                    return void await message.reply({ embeds: [embed] });
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, DailyCommand.name);
            Logger.warn((err as Error).stack, DailyCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}