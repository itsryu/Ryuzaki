import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures';
import { GuildSubCommandData } from '../../Data/Commands/Utilities/GuildSubCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, OmitPartialGroupDMChannel } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class GuildSubCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, GuildSubCommandData);
    }

    commandExecute({ message, args }: { message: OmitPartialGroupDMChannel<Message>, args: string[] }) {
        try {
            const guild = this.client.guilds.cache.get(args[2]) ?? message.guild;

            if (guild) {
                const icon = guild.iconURL({ extension: 'png', size: 4096 });
                const banner = guild.bannerURL({ extension: 'png', size: 4096 });

                switch (args[0]) {
                    case 'image': {
                        switch (args[1]) {
                            case 'icon': {
                                if (!icon) {
                                    return void message.reply(this.client.t('utilities:servericon.!icon'));
                                } else {

                                    const embed = new ClientEmbed(this.client)
                                        .setTitle(this.client.t('utilities:servericon.title'))
                                        .addFields({ name: this.client.t('utilities:servericon.field'), value: `\`${guild.name}\``, inline: true })
                                        .setImage(icon);

                                    const button = new ButtonBuilder()
                                        .setEmoji('🔗')
                                        .setLabel(this.client.t('utilities:servericon.button'))
                                        .setURL(icon)
                                        .setStyle(ButtonStyle.Link);

                                    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                                    return void message.reply({ embeds: [embed], components: [row] });
                                }
                            }

                            case 'banner': {
                                if (!banner) {
                                    return void message.reply(this.client.t('utilities:serverbanner.!banner'));
                                } else {
                                    const embed = new ClientEmbed(this.client)
                                        .setTitle(this.client.t('utilities:serverbanner.title'))
                                        .addFields({ name: this.client.t('utilities:serverbanner.field'), value: `\`${guild.name}\``, inline: true })
                                        .setImage(banner);

                                    const button = new ButtonBuilder()
                                        .setEmoji('🔗')
                                        .setLabel(this.client.t('utilities:serverbanner.button'))
                                        .setURL(banner)
                                        .setStyle(ButtonStyle.Link);

                                    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                                    return void message.reply({ embeds: [embed], components: [row] });
                                }
                            }
                        }
                        break;
                    }

                    case 'info': {
                        return void message.reply('.');
                    }
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, GuildSubCommand.name);
            Logger.warn((err as Error).stack, GuildSubCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}