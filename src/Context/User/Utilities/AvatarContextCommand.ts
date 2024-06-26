import { Ryuzaki } from '../../../RyuzakiClient';
import { ContextCommandStructure, ClientEmbed } from '../../../Structures';
import { AvatarContextCommandData } from '../../../Data/Context/User/Utilities/AvatarContextCommandData';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContextMenuCommandInteraction } from 'discord.js';

export default class AvatarContextCommand extends ContextCommandStructure {
    constructor(client: Ryuzaki) {
        super(client, AvatarContextCommandData);
    }

    async commandExecute({ message }: { message: ContextMenuCommandInteraction }) {
        try {
            const user = await this.client.users.fetch(message.targetId);
            const avatar = user.displayAvatarURL({ extension: 'png', size: 4096 });

            const embed = new ClientEmbed(this.client)
                .setTitle(this.client.t('utilities:avatar.title'))
                .addFields(
                    {
                        name: this.client.t('utilities:avatar.field'),
                        value: `\`${user.username}\``,
                        inline: true
                    })
                .setImage(avatar);

            const button = new ButtonBuilder()
                .setEmoji('🔗')
                .setLabel(this.client.t('utilities:avatar.button'))
                .setURL(avatar)
                .setStyle(ButtonStyle.Link);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
            return void await message.reply({ embeds: [embed], components: [row], ephemeral: true });
        } catch (err) {
            this.client.logger.error((err as Error).message, AvatarContextCommand.name);
            this.client.logger.warn((err as Error).stack, AvatarContextCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}