import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { WikiCommandData } from '../../Data/Commands/Utilities/WikiCommandData';
import { Languages } from '../../Types/ClientTypes';
import { Message } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class wikiCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, WikiCommandData);
    }

    async commandExecute({ message, args, language }: { message: Message, args: string[], language: Languages }) {
        try {
            const search = args.join(' ');

            const body = await fetch(this.client.t('utilities:wiki.body', { locale: language.split('-')[0], url: encodeURIComponent(search) }))
                .then((res) => res.json() as any)
                .catch(() => undefined);

            if (!body) {
                return void message.reply(this.client.t('utilities:wiki.!body'));
            } else if (body.title && body.title === 'Not found.') {
                return void message.reply(this.client.t('utilities:wiki.!body'));
            } else {
                const embed = new ClientEmbed(this.client)
                    .setTitle(body.title)
                    .setURL(body.content_urls.desktop.page)
                    .setDescription(body.extract)
                    .addFields(
                        {
                            name: this.client.t('utilities:wiki:result.field'),
                            value: `**[Wikipédia](${body.content_urls.desktop.page})**`,
                            inline: true
                        })
                    .setFooter({ text: this.client.t('utilities:wiki:result.footer'), iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/800px-Wikipedia-logo-v2.svg.png' });

                if (body.thumbnail) embed.setThumbnail(body.thumbnail.source);

                return void await message.reply({ embeds: [embed] });
            }
        } catch (err) {
            Logger.error((err as Error).message, wikiCommand.name);
            Logger.warn((err as Error).stack, wikiCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}