import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures';
import { AvatarCommandData } from '../../data/commands/Utilities/AvatarCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, OmitPartialGroupDMChannel } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class AvatarCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, AvatarCommandData);
    }

    async commandExecute({ message, args }: { message: OmitPartialGroupDMChannel<Message>, args: string[] }) {
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
            Logger.error((err as Error).message, AvatarCommand.name);
            Logger.warn((err as Error).stack, AvatarCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}