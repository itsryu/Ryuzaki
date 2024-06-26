import { Ryuzaki } from '../../../RyuzakiClient';
import { ContextCommandStructure, ClientEmbed } from '../../../Structures/';
import { BannerContextCommandData } from '../../../Data/Context/User/Utilities/BannerContextCommandData';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContextMenuCommandInteraction } from 'discord.js';

export default class BannerContextCommand extends ContextCommandStructure {
    constructor(client: Ryuzaki) {
        super(client, BannerContextCommandData);
    }

    async commandExecute({ message }: { message: ContextMenuCommandInteraction }) {
        try {
            const user = await this.client.users.fetch(message.targetId);

            await user.fetch()
                .then(async (user) => {
                    const banner = user.bannerURL({ extension: 'png', size: 4096 });

                    if (!banner) {
                        return message.reply({ content: this.client.t('utilities:banner:errors.!banner'), ephemeral: true });
                    } else {
                        const embed = new ClientEmbed(this.client)
                            .setTitle(this.client.t('utilities:banner.title'))
                            .addFields(
                                {
                                    name: this.client.t('utilities:banner.field'),
                                    value: `\`${user.username}\``,
                                    inline: true
                                })
                            .setImage(banner);

                        const button = new ButtonBuilder()
                            .setEmoji('🔗')
                            .setLabel(this.client.t('utilities:banner.button'))
                            .setURL(banner)
                            .setStyle(ButtonStyle.Link);

                        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                        return await message.reply({ embeds: [embed], components: [row], ephemeral: true });
                    }
                });
        } catch (err) {
            this.client.logger.error((err as Error).message, BannerContextCommand.name);
            this.client.logger.warn((err as Error).stack, BannerContextCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}
