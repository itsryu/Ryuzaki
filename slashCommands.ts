import { RawCommandData, RawContextCommandData } from './src/Structures';
import { ApplicationCommand, PermissionsBitField, REST, Routes } from 'discord.js';
import { Logger } from './src/Utils/logger';
import { Ryuzaki } from './src/RyuzakiClient';

export class SlashCommands {
    public static readonly rest: REST = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);

    public static async register(client: Ryuzaki) {
        const commands: RawContextCommandData[] & RawCommandData[] = [];
        const commandFolders = client.commands.map((command) => command.data.options);
        const contextFolders = client.contexts.map((context) => context.data.options);

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
            const data = await this.rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }) as ApplicationCommand[];

            Logger.info(`Updated ${data.length} slash command(s) (/) successfully!`, 'Slash Commands');
        } catch (error) {
            Logger.error((error as Error).message, SlashCommands.name);
            Logger.warn((error as Error).stack, SlashCommands.name);
        }
    }
}

