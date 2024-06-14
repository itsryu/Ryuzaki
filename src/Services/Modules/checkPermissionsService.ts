import { Ryuzaki } from '../../RyuzakiClient';
import { flagTexts, FlagKey } from '../../Utils/Objects/flags';
import { ServiceStructure, ClientEmbed, CommandStructure } from '../../Structures';
import { Message, PermissionsBitField } from 'discord.js';

export default class checkPermissionsService extends ServiceStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: 'checkPermissions',
            initialize: false
        });
    }

    serviceExecute({ message, command, language }: { message: Message, command: CommandStructure, language: string }) {
        try {
            const sendPermissionError = (command: CommandStructure, isBotPermission: boolean) => {
                const permissions = isBotPermission ?
                    new PermissionsBitField(command.data.options.permissions.client) :
                    new PermissionsBitField(command.data.options.permissions.member);

                const array: string[] = [];

                for (const flag in flagTexts) {
                    if (permissions.toArray().includes(flag as FlagKey)) {
                        array.push(flagTexts[flag][language]);
                    }
                }

                const embed = new ClientEmbed(this.client)
                    .setAuthor({ name: this.client.t('main:permissions.title'), iconURL: isBotPermission ? this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) : message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
                    .setDescription(`${isBotPermission ? this.client.t('main:permissions.alert', { user: message.author, index: 0 }) : this.client.t('main:permissions.alert', { user: message.author, index: 1 })} ${this.client.t('main:permissions.alert', { index: 2, permissions: array.join(', ').replace(/,([^,]*)$/, ' e$1') })}`);

                message.reply({ embeds: [embed] });
                return false;
            };

            if (command.data.options.permissions.client.length > 0 && !message.guild?.members.me?.permissions.has(command.data.options.permissions.client)) {
                return sendPermissionError(command, true);
            }

            if (command.data.options.permissions.member.length > 0 && !message.member?.permissions.has(command.data.options.permissions.member)) {
                return sendPermissionError(command, false);
            }

            return true;
        } catch (err) {
            this.client.logger.error((err as Error).message, checkPermissionsService.name);
            this.client.logger.warn((err as Error).stack!, checkPermissionsService.name);
        }
    }
}