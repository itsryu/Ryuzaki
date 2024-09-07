import { Message, MessageComponentInteraction } from 'discord.js';
import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, CommandStructure } from '../../Structures/';
import { RankMoneyCommandData } from '../../Data/Commands/Economy/RankMoneyCommandData';
import { Abbrev } from '../../Utils/abbrev';
import { Logger } from '../../Utils/logger';

export default class RankMoneyCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, RankMoneyCommandData);
    }

    public async commandExecute({ message }: { message: Message }) {
        try {
            const collection = await Ryuzaki.database.users.find({
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
                const ranking = coinsMap.findIndex((x) => x?.user.id === message.author.id) + 1;
                const description = coinsMap.slice(0, 100).map((x, i) => `**${i + 1}º** **[${x?.user.tag}](https://discord.com/users/${x?.user.id})** - **R$${new Abbrev(x?.coins ?? 0).toString()}**\n**ID:** \`${x?.user.id}\``);
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

                collector.on('collect', async (i) => {
                    current += i.customId === '+' ? 1 : -1;

                    await msg.edit({
                        content: `Página: ${current + 1}/${pages.length}`, embeds: [pages[current]], components: [
                            this.client.utils.button(current + 1, current <= 0, current >= pages.length - 1)
                        ]
                    });
                });

                collector.on('end', async () => {
                    pages[current].setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) });
                    return void await msg.edit({ embeds: [pages[current]], components: [this.client.utils.button(current + 1, true, true)] });
                });
            } else {
                return void await message.reply({ content: `${message.author}, não há usuários no banco de dados.` });
            }
        } catch (err) {
            Logger.error((err as Error).message, RankMoneyCommand.name);
            Logger.warn((err as Error).stack, RankMoneyCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}