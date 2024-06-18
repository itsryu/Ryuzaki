import { Message, MessageComponentInteraction } from 'discord.js';
import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, CommandStructure } from '../../Structures/';
import { RankMoneyCommandData } from '../../Data/Commands/Economy/RankMoneyCommandData';

export default class RankMoneyCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, RankMoneyCommandData);
    }

    public async commandExecute({ message }: { message: Message }) {
        const collection = await this.client.database.users.find({
            $or: [
                { 'economy.bank': { $gt: 0 } },
                { 'economy.coins': { $gt: 0 } }
            ]
        });

        const members = await Promise.all(collection.map(async ({ _id }) => {
            const user = await this.client.users.fetch(_id).catch(() => undefined);

            if (user) {
                const userData = await this.client.getData(user.id, 'user');

                if (userData) {
                    return {
                        user: user,
                        coins: userData.economy.coins + userData.economy.bank
                    };
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        }));

        if (members.length > 0) {
            const coinsMap = members.sort((a, b) => (b?.coins ?? 0) - (a?.coins ?? 0));
            const ranking = coinsMap.findIndex((x) => x?.user?.id === message.author.id) + 1;
            const description = coinsMap.slice(0, 100).map((x, i) => `**${i + 1}º** **[${x?.user?.tag}](https://discord.com/users/${x?.user?.id})** - **R$${this.client.utils.toAbbrev(x?.coins ?? 0)}**\n**ID:** \`${x?.user?.id}\``);
            const pages: ClientEmbed[] = [];
            let current = 0;

            for (let i = 0; i < description.length; i += 10) {
                const embed = new ClientEmbed(this.client)
                    .setAuthor({ name: 'Ranking Monetário', iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                    .setDescription(description.slice(i, i + 10).join('\n\n'))
                    .setFooter({ text: `Sua colocação: ${ranking}º lugar`, iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) });

                pages.push(embed);
            }

            const msg = await message.reply({ content: `Página: 1/${pages.length}`, embeds: [pages[0]], components: [this.client.utils.button(1, true, pages.length === 1)] });
            const filter = (i: MessageComponentInteraction) => i.user.id === message.author.id && i.isButton() && i.message.id === msg.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 3 });

            collector.on('collect', (i) => {
                current += i.customId === '+' ? 1 : -1;

                msg.edit({
                    content: `Página: ${current + 1}/${pages.length}`, embeds: [pages[current]], components: [
                        this.client.utils.button(current + 1, current <= 0, current >= pages.length - 1)
                    ]
                });
            });

            collector.on('end', () => {
                pages[current].setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });
                return void msg.edit({ embeds: [pages[current]], components: [this.client.utils.button(current + 1, true, true)] });
            });
        } else {
            return void message.reply({ content: `${message.author}, não há usuários no banco de dados.` })
        }
    }
}