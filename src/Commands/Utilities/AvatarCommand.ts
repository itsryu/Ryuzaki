import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures';
import { AvatarCommandData } from '../../Data/Commands/Utilities/AvatarCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default class AvatarCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, AvatarCommandData);
    }

    async commandExecute({ message, args }: { message: Message, args: string[] }) {
        try {
            const user = message.mentions?.users?.first() ?? await this.client.users.fetch(args[0]).catch(() => undefined) ?? message.author;

            if (args[0] == 'avatar') {
                const member = message.guild?.members.cache.get(user.id);
                const avatar = member?.displayAvatarURL({ extension: 'png', size: 4096 });

                if (avatar) {
                    const embed = new ClientEmbed(this.client)
                        .setTitle(this.client.t('utilities:avatar.title'))
                        .addFields({ name: this.client.t('utilities:avatar.field'), value: `\`${member?.user.username}\``, inline: true })
                        .setImage(avatar);

                    const button = new ButtonBuilder()
                        .setEmoji('🔗')
                        .setLabel(this.client.t('utilities:avatar.button'))
                        .setURL(avatar)
                        .setStyle(ButtonStyle.Link);

                    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                    return void await message.reply({ embeds: [embed], components: [row] });
                }
            } else {
                const avatar = user.displayAvatarURL({ extension: 'png', size: 4096 });

                const embed = new ClientEmbed(this.client)
                    .setTitle(this.client.t('utilities:avatar.title'))
                    .addFields({ name: this.client.t('utilities:avatar.field'), value: `\`${user.username}\``, inline: true })
                    .setImage(avatar);

                const button = new ButtonBuilder()
                    .setEmoji('🔗')
                    .setLabel(this.client.t('utilities:avatar.button'))
                    .setURL(avatar)
                    .setStyle(ButtonStyle.Link);

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                return void await message.reply({ embeds: [embed], components: [row] });
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, AvatarCommand.name);
            this.client.logger.warn((err as Error).stack, AvatarCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}