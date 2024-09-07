import { Ryuzaki } from '../../RyuzakiClient';
import { ServiceStructure, CommandStructure, ListenerStructure, RawListenerStructure, ContextCommandStructure } from '../../Structures';
import { readdirSync } from 'node:fs';
import { GlobalFonts } from '@napi-rs/canvas';
import { join } from 'node:path';
import { Logger } from '../../Utils/logger';

export default class LoadModulesService extends ServiceStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: 'LoadModules',
            initialize: true
        });
    }

    async serviceExecute() {
        try {
            await this.loadEvents();
            await this.loadCommands();
            await this.loadFonts();
        } catch (err) {
            Logger.error((err as Error).message, LoadModulesService.name);
            Logger.warn((err as Error).stack, LoadModulesService.name);
        }
    }

    private async loadCommands(): Promise<void> {
        try {
            const commandFolders = readdirSync(join(__dirname, '../../Commands'), { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
            const contextCommandsFolders = readdirSync(join(__dirname, '../../Context'), { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);

            await Promise.all(
                commandFolders.map(async (folder) => {
                    const commandFiles = readdirSync(join(__dirname, '../../Commands/', folder), { withFileTypes: true }).filter((dirent) => dirent.isFile() && dirent.name.endsWith('.js')).map((dirent) => dirent.name);

                    await Promise.all(
                        commandFiles.map(async (file) => {
                            const { default: ContextCommandClass }: { default: new (client: Ryuzaki) => CommandStructure } = await import(join(__dirname, '../../Commands', folder, file));
                            const command = new ContextCommandClass(this.client);

                            this.client.commands.set(command.data.options.name, command);
                        })
                    );
                })
            );

            await Promise.all(
                contextCommandsFolders.map(async (folder) => {
                    const subContextFolder = readdirSync(join(__dirname, '../../Context/', folder), { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);

                    await Promise.all(
                        subContextFolder.map(async (subFolder) => {
                            const contextFiles = readdirSync(join(__dirname, '../../Context/', folder, subFolder), { withFileTypes: true }).filter((dirent) => dirent.isFile() && dirent.name.endsWith('.js')).map((dirent) => dirent.name);

                            await Promise.all(
                                contextFiles.map(async (file) => {
                                    const { default: CommandClass }: { default: new (client: Ryuzaki) => ContextCommandStructure } = await import(join(__dirname, '../../Context/', folder, subFolder, file));
                                    const command = new CommandClass(this.client);

                                    this.client.contexts.set(command.data.options.name, command);
                                })
                            );
                        })
                    );
                })
            );

            Logger.info(`${this.client.commands.size} commands loaded successfully.`, 'Commands');
            Logger.info(`${this.client.contexts.size} context commands loaded successfully.`, 'Context Commands');
        } catch (err) {
            Logger.error((err as Error).message, [LoadModulesService.name, this.loadCommands.name]);
            Logger.warn((err as Error).stack, [LoadModulesService.name, this.loadCommands.name]);
        }
    }

    private async loadEvents(): Promise<void> {
        try {
            const listenersFolders = readdirSync(join(__dirname, '../../Listeners/Client'), { withFileTypes: true }).filter((dirent) => dirent.isFile() && dirent.name.endsWith('.js')).map((dirent) => dirent.name);
            const rawListenersFolder = readdirSync(join(__dirname, '../../Listeners/Gateway'), { withFileTypes: true }).filter((dirent) => dirent.isFile() && dirent.name.endsWith('.js')).map((dirent) => dirent.name);

            const listeners = await Promise.all(
                listenersFolders.map(async (file) => {
                    const { default: EventClass }: { default: new (client: Ryuzaki) => ListenerStructure } = await import(join(__dirname, '../../Listeners/Client', file));
                    const event = new EventClass(this.client);

                    return event.options.once
                        ? this.client.once(event.options.name, (...args) => event.eventExecute(...args))
                        : this.client.on(event.options.name, (...args) => event.eventExecute(...args));
                })
            );

            const rawListeners = await Promise.all(
                rawListenersFolder.map(async (file) => {
                    const { default: EventClass }: { default: new (client: Ryuzaki) => RawListenerStructure } = await import(join(__dirname, '../../Listeners/Gateway', file));
                    const event = new EventClass(this.client);

                    return event.options.once
                        ? this.client.ws.once(event.options.name, (...args) => event.eventExecute(...args))
                        : this.client.ws.on(event.options.name, (...args) => event.eventExecute(...args));
                })
            );

            Logger.info(`Added ${listeners.flat().length} listeners to the client.`, 'Listeners');
            Logger.info(`Added ${rawListeners.flat().length} raw listeners to the client.`, 'RawListeners');
        } catch (err) {
            Logger.error((err as Error).message, [LoadModulesService.name, this.loadEvents.name]);
            Logger.warn((err as Error).stack, [LoadModulesService.name, this.loadEvents.name]);
        }
    }

    private async loadFonts(): Promise<void> {
        try {
            const fontFiles = readdirSync(join('./Assets/fonts')).filter((file) => file.endsWith('.ttf'));

            const fonts = await Promise.all(
                fontFiles.map((file) => {
                    const fontName = file.replace('.ttf', '');
                    GlobalFonts.registerFromPath(`./src/Assets/fonts/${file}`, fontName);
                })
            );

            Logger.info(`${fonts.flat().length} fonts registered successfully.`, 'Fonts');
        } catch (err) {
            Logger.error((err as Error).message, [LoadModulesService.name, this.loadFonts.name]);
            Logger.warn((err as Error).stack, [LoadModulesService.name, this.loadFonts.name]);
        }
    }
}