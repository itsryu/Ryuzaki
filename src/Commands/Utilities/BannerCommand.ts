import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { BannerCommandData } from '../../Data/Commands/Utilities/BannerCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class BannerCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, BannerCommandData);
    }

    async commandExecute({ message, args }: { message: Message, args: string[] }) {
        try {
            const user = message.mentions?.users?.first() ?? await this.client.users.fetch(args[0]).catch(() => undefined) ?? message.author;

            await user.fetch()
                .then(async (user) => {
                    const banner = user.bannerURL({ extension: 'png', size: 4096 });

                    if (!banner) {
                        return void message.reply(this.client.t('utilities:banner:errors.!banner'));
                    } else {
                        const embed = new ClientEmbed(this.client)
                            .setTitle(this.client.t('utilities:banner.title'))
                            .addFields({ name: this.client.t('utilities:banner.field'), value: `\`${user.username}\``, inline: true })
                            .setImage(banner);

                        const button = new ButtonBuilder()
                            .setEmoji('🔗')
                            .setLabel(this.client.t('utilities:banner.button'))
                            .setURL(banner)
                            .setStyle(ButtonStyle.Link);

                        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                        return void await message.reply({ embeds: [embed], components: [row] });
                    }
                })
                .catch(() => message.reply(this.client.t('utilities:banner:errors.!banner')));
        } catch (err) {
            Logger.error((err as Error).message, BannerCommand.name);
            Logger.warn((err as Error).stack, BannerCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}