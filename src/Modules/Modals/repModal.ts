import { Ryuzaki } from '../../RyuzakiClient';
import { ModuleStructure } from '../../Structures/ModuleStructures';
import { AttachmentBuilder, ModalSubmitInteraction } from 'discord.js';
import { profileConstructor } from '../../Utils/profileConstructor';


export default class repModal extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

    async moduleExecute(interaction: ModalSubmitInteraction) {
        const id = interaction.message?.attachments.first()?.description;

        if (id) {
            const user = await this.client.users.fetch(id).catch(() => undefined);

            if (user) {
                const messageUserData = await this.client.getData(interaction.user.id, 'user');
                const userData = await this.client.getData(user.id, 'user');
                const reason = interaction.fields.getTextInputValue('repInput');


                if (!messageUserData || !userData) {
                    return void interaction.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
                } else {
                    const rep = messageUserData.reps;
                    const cooldown = 1000 * 60 * 30 - (Date.now() - rep.time);

                    if (cooldown > 0) {
                        return void interaction.reply({ content: `Você pode enviar outra reputação em: ||<t:${Math.floor((Date.now() + cooldown) / 1000)}:f> (<t:${Math.floor((Date.now() + cooldown) / 1000)}:R>)||.` });
                    } else {

                        await userData.updateOne({
                            $push: { 'reps.array': { user: user.id, from: interaction.user.id, reputation: reason, time: Date.now() } },
                            new: true
                        });

                        await messageUserData.updateOne({
                            $push: { 'reps.array': { user: user.id, from: user.id, reputation: reason, time: Date.now() } },
                            $set: { 'reps.time': Date.now() },
                            new: true
                        });

                        await messageUserData.save();

                        const profileBuild = await (new profileConstructor(this.client).moduleExecute({ user, data: userData, message: interaction }));
                        const attachment = new AttachmentBuilder(profileBuild.toBuffer('image/png'), { name: 'profile_card.png', description: user.id });

                        interaction.deferUpdate();
                        return void interaction.message?.edit({ files: [attachment] });
                    }
                }
            }
        }
    }
}