import { ModuleStructure, RawCommandData, RawContextCommandData } from './src/Structures';
import { ApplicationCommand, PermissionsBitField, Routes } from 'discord.js';

export default class RegisterSlashCommands extends ModuleStructure {
    async moduleExecute() {
        const commands: RawContextCommandData[] & RawCommandData[] = [];
        const commandFolders = this.client.commands.map((command) => command.data.options);
        const contextFolders = this.client.contexts.map((context) => context.data.options);

        commandFolders.forEach((command) => {
            if (command.config.registerSlash) {
                if (command.permissions.member.length) {
                    command.default_member_permissions = BigInt(new PermissionsBitField(command.permissions.member).bitfield).toString();
                }

                commands.push(command);
            }
        });

        contextFolders.forEach((context) => {
            if (context.config.registerSlash) {
                if (context.permissions.member.length) {
                    context.default_member_permissions = BigInt(new PermissionsBitField(context.permissions.member).bitfield).toString();
                }

                commands.push(context);
            }
        });

        //===============> Registrando os comandos <===============//
        try {
            const data = await this.client.rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }) as ApplicationCommand[];

            this.client.logger.info(`Updated ${data.length} slash command(s) (/) successfully!`, 'Slash Commands');
        } catch (error) {
            this.client.logger.error((error as Error).message, RegisterSlashCommands.name);
            this.client.logger.warn((error as Error).stack, RegisterSlashCommands.name);
        }
    }
}

