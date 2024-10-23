import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure, ClientEmbed } from '../../structures';
import { InviteCommandData } from '../../data/commands/utilities/inviteCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, OmitPartialGroupDMChannel } from 'discord.js';
import { Logger } from '../../utils';

export default class InviteCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, InviteCommandData);
    }

    async commandExecute({ message }: { message: OmitPartialGroupDMChannel<Message> }) {
        try {
            const link = this.client.getInvite;

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
            Logger.error((err as Error).message, InviteCommand.name);
            Logger.warn((err as Error).stack, InviteCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}