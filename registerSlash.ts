import { join } from 'node:path';
import { Ryuzaki } from './src/RyuzakiClient';
import { CommandStructure, RawCommandData } from './src/Structures';
import { ApplicationCommand, PermissionsBitField, REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';

export default class RegisterSlashCommands {
    readonly client: Ryuzaki;

    constructor(client: Ryuzaki) {
        this.client = client;
    }

    async registerSlash() {
        const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);

        //===============> Pegando todos os comandos das pastas <===============//
        const commands: RawCommandData[] = [];
        const commandFolders = readdirSync(join(__dirname, 'src/Commands'));
        const contextFolders = readdirSync(join(__dirname, 'src/Context'));

        for (const folder of contextFolders) {
            const subContextFolder = readdirSync(join(__dirname, `./src/Context/${folder}`));

            for (const subFolder of subContextFolder) {
                const contextFiles = readdirSync(join(__dirname, `./src/Context/${folder}/${subFolder}`), { withFileTypes: true }).filter((dirent) => dirent.isFile() && dirent.name.endsWith('.js')).map((dirent) => dirent.name);

                for (const file of contextFiles) {
                    const { default: contextCommandClass } = await import(`./src/Context/${folder}/${subFolder}/${file}`);
                    const command = new contextCommandClass(this);

                    commands.push(command.data.options);
                }
            }
        }

        for (const folder of commandFolders) {
            const commandFiles = readdirSync(join(__dirname, './src/Commands/', folder), { withFileTypes: true }).filter((dirent) => dirent.isFile() && dirent.name.endsWith('.js')).map((dirent) => dirent.name);

            for (const file of commandFiles) {
                const { default: commandClass }: { default: new (client: Ryuzaki) => CommandStructure } = await import(`./src/Commands/${folder}/${file}`);
                const command = new commandClass(this.client);

                if (command.data.options.config.registerSlash) {
                    if (command.data.options.permissions.member.length) {
                        command.data.options.default_member_permissions = BigInt(new PermissionsBitField(command.data.options.permissions.member).bitfield).toString();
                    }

                    commands.push(command.data.options);
                }
            }
        }

        //===============> Registrando os comandos <===============//
        try {
            const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }) as ApplicationCommand[];

            this.client.logger.info(`Updated ${data.length} slash command(s) (/) successfully!`, 'Slash Commands');
        } catch (error) {
            console.error(error);
        }
    }
}

