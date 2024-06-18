import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { VoteCommandData } from '../../Data/Commands/Utilities/VoteCommandData';
import { Message } from 'discord.js';

export default class voteCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, VoteCommandData);
    }

    async commandExecute({ message }: { message: Message }) {
        const userData = await this.client.getData(message.author.id, 'user');

        if (!userData) {
            return void message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
        } else {
            const vote = userData.economy.vote;
            const votes = userData.economy.votes;
            const cooldown = 60000 * 60 * 12 - (Date.now() - vote);

            if (vote !== null && cooldown > 0) {
                const reedemedEmbed = new ClientEmbed(this.client)
                    .setAuthor({ name: 'Discord Bot List', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                    .setDescription(this.client.t('utilities:vote:embeds:reedemed.description', { author: message.author, firstTime: Math.floor((Date.now() + cooldown) / 1000), secondTime: Math.floor((Date.now() + cooldown) / 1000) }));

                return void message.reply({ embeds: [reedemedEmbed] });
            } else {
                const voteEmbed = new ClientEmbed(this.client)
                    .setAuthor({ name: 'Discord Bot List', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                    .setDescription(this.client.t('utilities:vote:embeds:vote.description', { author: message.author, votes, url: 'https://top.gg/bot/1117629775046004766' }))
                    .setFooter({ text: this.client.t('utilities:vote:embeds:vote.footer') });

                return void message.reply({ embeds: [voteEmbed] });
            }
        }
    }
}