import { Ryuzaki } from '../../ryuzakiClient';
import { ClientEmbed, CommandStructure } from '../../../src/Structures/';
import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { Abbrev } from '../../Utils/abbrev';
import { LevelInfoCommandData } from '../../data/commands/infos/levelInfoCommandData';
import { Logger } from '../../Utils/logger';

export default class LevelInfoCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, LevelInfoCommandData);
    }

    async commandExecute({ message, args }: { message: OmitPartialGroupDMChannel<Message>, args: string[] }) {
        try {
            const user = message.mentions?.users?.first() ?? await this.client.users.fetch(args[0]).catch(() => undefined) ?? message.author;
            const userData = await this.client.getData(user.id, 'user');

            if (!user || !userData) {
                return void await message.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
            } else {
                const level = userData.exp.level;
                const nextLevelXp = userData.exp.nextLevel;
                const xp = userData.exp.xp;
                const totalXp = userData.exp.totalXp;
                const [progressString] = this.stringProgressBar(nextLevelXp, xp);
                const porcentage = this.getPorcentage(nextLevelXp, xp);

                const embed = new ClientEmbed(this.client)
                    .setTitle(`Nível: ${level}`)
                    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ extension: 'png', size: 512 }) })
                    .addFields(
                        {
                            name: 'XP Total',
                            value: `\`${totalXp}\` \`(${new Abbrev(totalXp).toString()})\``,
                            inline: true
                        },
                        {
                            name: 'XP Atual',
                            value: `\`${xp}\` \`(${new Abbrev(xp).toString()})\``,
                            inline: true
                        },
                        {
                            name: 'XP faltando:',
                            value: `\`${nextLevelXp - xp}\` \`(${new Abbrev(nextLevelXp - xp).toString()})\``,
                            inline: true
                        },
                        {
                            name: 'XP Próximo Nível',
                            value: `\`${nextLevelXp}\` \`(${new Abbrev(nextLevelXp).toString()})\``,
                            inline: true
                        },
                        {
                            name: 'Progresso',
                            value: `${progressString} ${porcentage.toFixed(2)}%`,
                            inline: false
                        });

                return void await message.reply({ embeds: [embed] });
            }
        } catch (err) {
            Logger.error((err as Error).message, LevelInfoCommand.name);
            Logger.warn((err as Error).stack, LevelInfoCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }

    private getPorcentage(total: number, current: number) {
        return (current / total) * 100;
    }

    private stringProgressBar(total: number, current: number, size: number = 15, line: string = '▬', slider: string = '🔘') {
        if (current > total) {
            const bar = line.repeat(size + 2);
            const percentage = (current / total) * 100;

            return [bar, percentage];
        } else {
            const percentage = current / total;
            const progress = Math.round((size * percentage));
            const emptyProgress = size - progress;
            const progressText = line.repeat(progress).replace(/.$/, slider);
            const emptyProgressText = line.repeat(emptyProgress);
            const bar = progressText + emptyProgressText;
            const calculated = percentage * 100;

            return [bar, calculated];
        };
    };
}