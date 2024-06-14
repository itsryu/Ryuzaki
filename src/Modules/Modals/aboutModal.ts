import { Ryuzaki } from '../../RyuzakiClient';
import { ModuleStructure } from '../../Structures/';
import { profileConstructor } from '../../Utils/profileConstructor';
import { AttachmentBuilder, ModalSubmitInteraction } from 'discord.js';

export default class aboutModal extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

    async moduleExecute(interaction: ModalSubmitInteraction) {
        const user = interaction.user;
        const userDb = await this.client.getData(user.id, 'user');
        const about = interaction.fields.getTextInputValue('aboutInput');

        userDb.set({ 'about': about });
        userDb.save();

        const profileBuild = await (new profileConstructor(this.client).moduleExecute({ user, data: userDb, message: interaction }));
        const attachment = new AttachmentBuilder(profileBuild.toBuffer('image/png'), { name: 'profile_card.png', description: 'Your profile card.' });

        interaction.deferUpdate();
        return interaction.message?.edit({ files: [attachment] });
    }
}