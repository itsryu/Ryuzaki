import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { InviteCommandData } from '../../Data/Commands/Utilities/InviteCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default class InviteCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, InviteCommandData);
    }

    async commandExecute({ message }: { message: Message }) {
        try {
            const link = this.client.getInvite();

            const embed = new ClientEmbed(this.client)
                .setAuthor({ name: this.client.t('utilities:invite:embed.title'), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
                .setDescription(this.client.t('utilities:invite:embed.description', { link }));

            const invite = new ButtonBuilder()
                .setEmoji('🔗')
                .setLabel(this.client.t('utilities:invite:button.label'))
                .setURL(link)
                .setStyle(ButtonStyle.Link);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(invite);
            return void await message.reply({ embeds: [embed], components: [row] });
        } catch (err) {
            this.client.logger.error((err as Error).message, InviteCommand.name);
            this.client.logger.warn((err as Error).stack, InviteCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}