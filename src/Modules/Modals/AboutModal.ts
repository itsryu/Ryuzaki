import { ModuleStructure } from '../../Structures';
import { profileConstructor } from '../../Utils/profileConstructor';
import { AttachmentBuilder, ModalSubmitInteraction } from 'discord.js';
import { Logger } from '../../Utils/logger';

export default class AboutModal extends ModuleStructure {
    async moduleExecute(interaction: ModalSubmitInteraction) {
        try {
            const user = interaction.user;
            const userData = await this.client.getData(user.id, 'user');
            const about = interaction.fields.getTextInputValue('aboutInput');

            if (userData) {
                userData.set({ 'about': about });
                await userData.save();

                const profileBuild = await (new profileConstructor(this.client).moduleExecute({ user, data: userData, message: interaction }));
                const attachment = new AttachmentBuilder(profileBuild.toBuffer('image/png'), { name: 'profile_card.png', description: 'Your profile card.' });

                await interaction.deferUpdate();
                return void interaction.message?.edit({ files: [attachment] });
            }
        } catch (err) {
            Logger.error((err as Error).message, AboutModal.name);
            Logger.warn((err as Error).stack, AboutModal.name);
        }
    }
}