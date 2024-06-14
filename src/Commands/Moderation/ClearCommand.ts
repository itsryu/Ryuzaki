import { Ryuzaki } from '../../RyuzakiClient';
import { ClientEmbed, CommandStructure } from '../../Structures/';
import { ClearCommandData } from '../../Data/Commands/Moderation/ClearCommandData';
import { Collection, Message, TextChannel, GuildTextBasedChannel, PartialMessage } from 'discord.js';

export default class clearCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, ClearCommandData);
    }

    public async commandExecute({ message, args }: { message: Message, args: string[] }) {
        const amount = args[0];
        const limit = Number.isInteger(Number(amount)) ? Math.min(parseInt(amount), 100) : undefined;

        if (!limit) {
            return void message.reply({ content: this.client.t('moderation:clear:errors.args') });
        } else {
            const guildData = await this.client.getData(message.guild?.id, 'guild');

            switch (args[1]) {
                case 'bots': {
                    const botMessage = await message.channel.messages.fetch().then((msg: Collection<string, Message>) => msg.filter(msg => msg.author.bot).first(limit + 1));

                    return void (message.channel as TextChannel).bulkDelete(botMessage, true)
                        .then(messages => {
                            const cleanedEmbed = this.cleanedEmbed(message, messages);

                            if (guildData.logs.status && guildData.logs.moderation) {
                                const channel = message.guild?.channels.cache.get(guildData.logs.channel) as GuildTextBasedChannel;
                                if (channel) channel.send({ embeds: [cleanedEmbed] });
                            }

                            message.channel.send({ content: this.client.t('moderation:clear.success', { size: messages.size - 1 }) })
                                .then((replyMessage: Message) => setTimeout(() => replyMessage.delete(), 5000));
                        });
                }

                case 'pinned': {
                    const pinnedMessage = await message.channel.messages.fetch().then((msg: Collection<string, Message>) => msg.filter(msg => !msg.pinned).first(limit + 1));

                    return void (message.channel as TextChannel).bulkDelete(pinnedMessage, true)
                        .then(messages => {
                            const cleanedEmbed = this.cleanedEmbed(message, messages);

                            if (guildData.logs.status && guildData.logs.moderation) {
                                const channel = message.guild?.channels.cache.get(guildData.logs.channel) as GuildTextBasedChannel;
                                if (channel) channel.send({ embeds: [cleanedEmbed] });
                            }

                            message.channel.send({ content: this.client.t('moderation:clear.success', { size: messages.size - 1 }) })
                                .then((replyMessage: Message) => setTimeout(() => replyMessage.delete(), 5000));
                        });
                }

                case 'image': {
                    const imageMessage = await message.channel.messages.fetch().then((msg: Collection<string, Message>) => msg.filter(msg => msg.attachments.first()).first(limit + 1));

                    return void (message.channel as TextChannel).bulkDelete(imageMessage, true)
                        .then(messages => {
                            const cleanedEmbed = this.cleanedEmbed(message, messages);

                            if (guildData.logs.status && guildData.logs.moderation) {
                                const channel = message.guild?.channels.cache.get(guildData.logs.channel) as GuildTextBasedChannel;
                                if (channel) channel.send({ embeds: [cleanedEmbed] });
                            }

                            message.channel.send({ content: this.client.t('moderation:clear.success', { size: messages.size - 1 }) })
                                .then((replyMessage: Message) => setTimeout(() => replyMessage.delete(), 5000));
                        });
                }

                default: {
                    return void (message.channel as TextChannel).bulkDelete(limit, true)
                        .then(messages => {
                            const cleanedEmbed = this.cleanedEmbed(message, messages);

                            if (guildData.logs.status && guildData.logs.moderation) {
                                const channel = message.guild?.channels.cache.get(guildData.logs.channel) as GuildTextBasedChannel;
                                if (channel) channel.send({ embeds: [cleanedEmbed] });
                            }

                            message.channel.send({ content: this.client.t('moderation:clear.success', { size: messages.size - 1 }) })
                                .then((replyMessage: Message) => setTimeout(() => replyMessage.delete(), 5000));
                        })
                        .catch(() => { });
                }
            }
        }
    }

    private cleanedEmbed(message: Message, messages: Collection<string, Message | PartialMessage | undefined>): ClientEmbed {
        const cleanedEmbed = new ClientEmbed(this.client)
            .setAuthor({ name: this.client.t('moderation:clear:embeds:cleaned.title'), iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
            .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 4096 }))
            .setDescription(this.client.t('moderation:clear:embeds:cleaned.description', {author: message.author, authorId: message.author.id, messages: messages.size - 1, channel: message.channel, channelId: message.channel.id }));

        return cleanedEmbed;
    }
}