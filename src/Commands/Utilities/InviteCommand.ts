import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { InviteCommandData } from '../../Data/Commands/Utilities/InviteCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default class inviteCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, InviteCommandData);
    }

    commandExecute({ message }: { message: Message}) {
        const link = this.client.url;

        const embed = new ClientEmbed(this.client)
            .setAuthor({ name: this.client.t('utilities:invite:embed.title'), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })
            .setDescription(this.client.t('utilities:invite:embed.description', { link }));

        const invite = new ButtonBuilder()
            .setEmoji('🔗')
            .setLabel(this.client.t('utilities:invite:button.label'))
            .setURL(link)
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(invite);
        return void message.reply({ embeds: [embed], components: [row] });
    }
}