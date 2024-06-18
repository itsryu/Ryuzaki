import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures/';
import { CatsCommandData } from '../../Data/Commands/Fun/CatsCommandData';
import { Message } from 'discord.js';

export default class CatsCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, CatsCommandData);
    }

    public async commandExecute({ message }: { message: Message}) {
        const data = await fetch('https://api.thecatapi.com/v1/images/search')
            .then(response => response.json() as any);

        const embed = new ClientEmbed(this.client)
            .setImage(data[0].url);

        return void message.reply({ embeds: [embed] });
    }
}