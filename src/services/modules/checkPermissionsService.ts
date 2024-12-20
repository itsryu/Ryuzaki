import { Ryuzaki } from '../../ryuzakiClient';
import { PermissionsFlagsText, PermissionFlagKey } from '../../utils/objects';
import { ServiceStructure, ClientEmbed, CommandStructure } from '../../structures';
import { ChannelType, Message, PermissionsBitField } from 'discord.js';
import { Logger } from '../../utils';

export default class CheckPermissionsService extends ServiceStructure<boolean> {
    constructor(client: Ryuzaki) {
        super(client, {
            name: 'CheckPermissions',
            initialize: false
        });
    }

    async serviceExecute({ message, command, language }: { message: Message, command: CommandStructure, language: string }): Promise<boolean> {
        try {
            if (message.channel && message.channel.type === ChannelType.DM || command.data.options.config.isDMAllowed) {
                return true;
            } else if (command.data.options.permissions.client.length > 0 && !message.guild?.members.me?.permissions.has(command.data.options.permissions.client)) {
                return await this.sendPermissionError(message, language, command, true);
            } else if (command.data.options.permissions.member.length > 0 && !message.member?.permissions.has(command.data.options.permissions.member)) {
                return await this.sendPermissionError(message, language, command, false);
            } else {
                return true;
            }
        } catch (err) {
            Logger.error((err as Error).message, CheckPermissionsService.name);
            Logger.warn((err as Error).stack, CheckPermissionsService.name);
            return false;
        }
    }

    private async sendPermissionError(message: Message, language: string, command: CommandStructure, isBotPermission: boolean) {
        const permissions = isBotPermission ?
            new PermissionsBitField(command.data.options.permissions.client) :
            new PermissionsBitField(command.data.options.permissions.member);

        const array = Object.entries(PermissionsFlagsText)
            .filter(([flag]) => permissions.toArray().includes(flag as PermissionFlagKey))
            .map(([, text]) => text[language]);

        const embed = new ClientEmbed(this.client)
            .setAuthor({ name: this.client.t('main:permissions.title'), iconURL: isBotPermission ? this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) : message.author.displayAvatarURL({ extension: 'png', size: 4096 }) })
            .setDescription(`${isBotPermission ? this.client.t('main:permissions.alert', { user: message.author, index: 0 }) : this.client.t('main:permissions.alert', { user: message.author, index: 1 })} ${this.client.t('main:permissions.alert', { index: 2, permissions: array.join(', ').replace(/,([^,]*)$/, ' e$1') })}`);

        await message.reply({ embeds: [embed] });

        return false;
    };
}