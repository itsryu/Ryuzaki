import { Ryuzaki } from '../../RyuzakiClient';
import { emojis } from '../../Utils/Objects/emojis';
import { Languages } from '../../Types/ClientTypes';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { RyuCommandData } from '../../Data/Commands/Infos/RyuCommandData';
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class RyuCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, RyuCommandData);
    }

    async commandExecute({ message, prefix, language }: { message: Message, prefix: string, language: Languages }) {
        try {
            const owner = await this.client.users.fetch(process.env.OWNER_ID).catch(() => undefined);
            const username = this.client.user?.username;
            const thumbnail = this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 });
            const helpCommand = this.client.commands.get('help');

            if (helpCommand) {

                const embed = new ClientEmbed(this.client)
                    .setTitle(this.client.t('infos:ryu:embed.title', { client: username }))
                    .setThumbnail(thumbnail ?? null)
                    .addFields(
                        {
                            name: this.client.t('infos:ryu:embed:fields.name', { index: 0 }),
                            value: this.client.t('infos:ryu:embed:fields.value', { index: 0, author: message.author, tag: owner?.tag, id: owner?.id, help: helpCommand?.data.options.name_localizations ? (prefix + helpCommand.data.options.name_localizations[language]) : prefix + helpCommand?.data.options.name, usage: helpCommand?.data.options.usage[language]?.length ? helpCommand.data.options.usage[language]?.map((usage) => (helpCommand.data.options.name_localizations ? (prefix + helpCommand.data.options.name_localizations[language]) : (prefix + helpCommand.data.options.name)) + ' ' + usage).join('\n') : helpCommand?.data.options.name_localizations ? (prefix + helpCommand.data.options.name_localizations[language]) : (prefix + helpCommand?.data.options.name) })
                        });

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setURL('https://github.com/itsryu/Ryuzaki')
                            .setStyle(ButtonStyle.Link)
                            .setEmoji(emojis.github)
                            .setLabel(this.client.t('main:mentions:button.github')),
                        new ButtonBuilder()
                            .setURL(this.client.getInvite)
                            .setStyle(ButtonStyle.Link)
                            .setEmoji(emojis.pin)
                            .setLabel(this.client.t('main:mentions:button.add')),
                        new ButtonBuilder()
                            .setURL('https://discord.gg/R23XkNvRH2')
                            .setStyle(ButtonStyle.Link)
                            .setEmoji(emojis.partner)
                            .setLabel(this.client.t('main:mentions:button.support'))
                    );

                return void await message.reply({ embeds: [embed], components: [row] });
            }
        } catch (err) {
            Logger.error((err as Error).message, RyuCommand.name);
            Logger.warn((err as Error).stack, RyuCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}