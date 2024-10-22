import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { CatsCommandData } from '../../data/commands/Fun/CatsCommandData';
import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { Logger } from '../../Utils/logger';

interface CatData {
    id: string,
    url: string,
    width: number,
    height: number
}

export default class CatsCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, CatsCommandData);
    }

    public async commandExecute({ message }: { message: OmitPartialGroupDMChannel<Message> }) {
        try {
            const data = await fetch('https://api.thecatapi.com/v1/images/search')
                .then(response => response.json())
                .catch(() => undefined) as CatData[] | undefined;

            if (data) {
                const embed = new ClientEmbed(this.client)
                    .setImage(data[0].url);

                return void await message.reply({ embeds: [embed] });
            } else {
                return void await message.reply({ content: 'Erro ao obter a imagem. Tente novamente mais tarde.' });
            }
        } catch (err) {
            Logger.error((err as Error).message, CatsCommand.name);
            Logger.warn((err as Error).stack, CatsCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}