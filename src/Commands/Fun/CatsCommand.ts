import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { CatsCommandData } from '../../Data/Commands/Fun/CatsCommandData';
import { Message } from 'discord.js';

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

    public async commandExecute({ message }: { message: Message }) {
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
            this.client.logger.error((err as Error).message, CatsCommand.name);
            this.client.logger.warn((err as Error).stack, CatsCommand.name);
        }
    }
}