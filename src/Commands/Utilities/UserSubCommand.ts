import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { UserSubCommandData } from '../../Data/Commands/Utilities/UserSubCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default class UserSubCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, UserSubCommandData);
    }

    async commandExecute({ message, args }: { message: Message, args: string[] }) {
        switch (args[0]) {
            case 'image': {
                const user = message.mentions?.users.first() || await this.client.users.fetch(args[3]).catch(() => undefined) || message.author;

                switch (args[1]) {
                    case 'avatar': {
                        
                        switch (args[2]) {
                            case 'user': {
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
                                return void message.reply({ embeds: [embed], components: [row] });
                            }

                            case 'guild': {
                                const member = message.guild?.members.cache.get(user.id)!;
                                const avatar = member.displayAvatarURL({ extension: 'png', size: 4096 });

                                const embed = new ClientEmbed(this.client)
                                    .setTitle(this.client.t('utilities:avatar.title'))
                                    .addFields({ name: this.client.t('utilities:avatar.field'), value: `\`${member.user.username}\``, inline: true })
                                    .setImage(avatar);

                                const button = new ButtonBuilder()
                                    .setEmoji('🔗')
                                    .setLabel(this.client.t('utilities:avatar.button'))
                                    .setURL(avatar)
                                    .setStyle(ButtonStyle.Link);

                                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                                return void message.reply({ embeds: [embed], components: [row] });
                            }
                        }
                        break;
                    }

                    case 'banner': {
                        switch (args[2]) {
                            case 'user': {
                                return void user.fetch()
                                    .then((user) => {
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
                                            return void message.reply({ embeds: [embed], components: [row] });
                                        }
                                    });
                            }
                        }
                    }
                }
                break;
            }

            case 'info': {
                const user = message.mentions?.users.first() || await this.client.users.fetch(args[2]).catch(() => undefined) || message.author;

                console.log(user);

                return void message.reply('.');
            }
        }
    }
}