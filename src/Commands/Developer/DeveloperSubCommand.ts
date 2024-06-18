import { Ryuzaki } from '../../RyuzakiClient';
import { CommandStructure, ClientEmbed } from '../../Structures';
import { DeveloperSubCommandData } from '../../Data/Commands/Developer/DeveloperSubCommandData';
import { Message, MessageComponentInteraction, StringSelectMenuInteraction } from 'discord.js';
import { inspect } from 'node:util';

export default class DeveloperSubCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, DeveloperSubCommandData);
    }

    // @ts-ignore
    async commandExecute({ message, args, prefix, language }: { message: Message, args: string[], prefix: string, language: string }) {
        switch (args[0]) {
            case 'eval': {
                let current = 0;
                const pages: ClientEmbed[] = [];
                const res = args.slice(1).join(' ');

                try {
                    const result = await Promise.any([eval(res), Promise.reject()]);
                    const evaled = inspect(result);

                    for (let i = 0; i < evaled.length; i += 1000) {
                        const certo = new ClientEmbed(this.client)
                            .setTitle('📩 Entrada:')
                            .setDescription('```js' + '\n' + res + '\n' + '```')
                            .addFields(
                                {
                                    name: '✅ Saída:',
                                    value: '```js' + '\n' + await (this.client.utils.clean(evaled).substring(i, Math.min(evaled.length, i + 1000))) + '\n' + '```'
                                },
                                {
                                    name: '🕸️ Tipo:',
                                    value: '```diff' + '\n' + '- ' + typeof (result) + '\n' + '```'
                                });

                        pages.push(certo);
                    }
                } catch (err) {
                    for (let i = 0; i < (err as Error).message.length; i += 256) {
                        const errado = new ClientEmbed(this.client)
                            .setTitle('📩 Entrada:')
                            .setDescription('```js' + '\n' + res + '\n' + '```')
                            .addFields(
                                {
                                    name: '❌ Saída:',
                                    value: '```js' + '\n' + this.client.utils.clean((err as Error).message).substring(i, Math.min((err as Error).message.length, i + 256)) + '\n' + '```'
                                });

                        pages.push(errado);
                    }
                }

                const msg = await message.reply({ embeds: [pages[current]], components: [this.client.utils.button(1, current <= 0 ? true : false, pages.length <= 1 ? true : false)] });
                const filter = (i: MessageComponentInteraction) => (i.user.id === message.author.id && i.isButton() && i.message.id === msg.id) ? (i.deferUpdate(), true) : (i.reply({ content: this.client.t('client:interaction.user', { user: i.user }), ephemeral: true }), false);
                const collector = msg.createMessageComponentCollector({ filter, time: 60000 * 3 });

                collector.on('end', () => {
                    msg.edit({ embeds: [pages[current].setFooter({ text: this.client.t('client:embed.footer', { client: this.client.user?.username }), iconURL: this.client.user?.displayAvatarURL({ extension: 'png', size: 4096 }) })], components: [this.client.utils.button(current + 1, true, true)] });
                });

                collector.on('collect', (i: StringSelectMenuInteraction) => {
                    if (i.customId === '-') current -= 1;
                    if (i.customId === '+') current += 1;

                    return void void msg.edit({ content: `Página: ${current + 1}/${pages.length}`, embeds: [pages[current]], components: [this.client.utils.button(current + 1, current <= 0 ? true : false, current === pages.length - 1 ? true : false)] });
                });

                break;
            }

            case 'maintenance': {
                switch (args[1]) {
                    case 'add': {
                        switch (args[2]) {
                            case 'command': {
                                const name = args[3];
                                const command = this.client.commands.get(name) || this.client.commands.find((command) => command.data.options.aliases[language].includes(name));

                                if (!command) {
                                    return void void message.reply({ content: `Não encontrei nenhum comando chamado ${name}.` });
                                } else {
                                    const commandData = await this.client.getData(command.data.options.name, 'command');

                                    if (!commandData) {
                                        return void message.reply({ content: `Erro ao obter os dados do comando \`${command.data.options.name}\`. Tente novamente mais tarde.` });
                                    } else if (commandData.maintenance) {
                                        return void void message.reply({ content: `O comando \`${command.data.options.name}\` já se encontra em manutenção.` });
                                    } else {
                                        await commandData.updateOne({ $set: { maintenance: true } }, { new: true });
                                        return void message.reply({ content: `O comando \`${command.data.options.name}\` foi adicionado com sucesso da manutenção.` });
                                    }
                                }
                            }

                            case 'client': {
                                const clientData = await this.client.getData(this.client.user?.id, 'client');

                                if (!clientData) {
                                    return void message.reply({ content: `Erro ao obter os dados do \`${this.client.user?.username}\`. Tente novamente mais tarde.` });
                                } else if (clientData.maintenance) {
                                    return void message.reply({ content: `O \`${this.client.user?.username}\` já se encontra em manutenção.` });
                                } else {
                                    await clientData.updateOne({ $set: { maintenance: true } }, { new: true });
                                    return void message.reply({ content: `O \`${this.client.user?.username}\` foi adicionado com sucesso em manutenção.` });
                                }
                            }
                        }
                        break;
                    }

                    case 'remove': {
                        switch (args[2]) {
                            case 'command': {
                                const name = args[3];
                                const command = this.client.commands.get(name) || this.client.commands.find((command) => command.data.options.aliases[language].includes(name));

                                if (!command) {
                                    return void message.reply({ content: `Não encontrei nenhum comando chamado ${name}.` });
                                } else {
                                    const commandData = await this.client.getData(command.data.options.name, 'command');

                                    if (!commandData) {
                                        return void message.reply({ content: `Erro ao obter os dados do comando \`${command.data.options.name}\`. Tente novamente mais tarde.` });
                                    } else if (!commandData.maintenance) {
                                        return void message.reply({ content: `O comando \`${command.data.options.name}\` não se encontra em manutenção.` });
                                    } else {
                                        await commandData.updateOne({ $set: { maintenance: false } }, { new: true });
                                        return void message.reply({ content: `O comando \`${command.data.options.name}\` foi removido com sucesso da manutenção.` });
                                    }
                                }
                            }

                            case 'client': {
                                const clientData = await this.client.getData(this.client.user?.id, 'client');

                                if (!clientData) {
                                    return void message.reply({ content: `Erro ao obter os dados do \`${this.client.user?.username}\`. Tente novamente mais tarde.` });
                                } else if (!clientData.maintenance) {
                                    return void message.reply({ content: `O \`${this.client.user?.username}\` não se encontra em manutenção.` });
                                } else {
                                    await clientData.updateOne({ $set: { maintenance: false } }, { new: true });
                                    return void message.reply({ content: `O \`${this.client.user?.username}\` foi removido com sucesso da manutenção.` });
                                }
                            }
                        }
                    }
                }
                break;
            }

            case 'blacklist': {
                switch (args[1]) {
                    case 'add': {
                        const user = await this.client.users.fetch(args[3]).catch(() => undefined);
                        const clientData = await this.client.getData(this.client.user?.id, 'client');

                        if (!user) {
                            return void message.reply({ content: 'Não pude localizar nenhum usuário com as informações fornecidas.' });
                        } else if (!clientData) {
                            return void message.reply({ content: `Erro ao obter os dados do \`${this.client.user?.username}\`. Tente novamente mais tarde.` });
                        } else if (clientData.blacklist.some((id) => user.id === id)) {
                            return void message.reply({ content: `O usuário \`${user.tag}\` já se encontra em minha lista negra.` });
                        } else {
                            await clientData.updateOne({ $push: { blacklist: user.id } }, { new: true });

                            return void message.reply({ content: `O usuário \`${user.tag}\` foi adicionado(a) com sucesso na minha lista negra.` });
                        }
                    }

                    case 'remove': {
                        const user = await this.client.users.fetch(args[3]).catch(() => undefined);
                        const clientData = await this.client.getData(this.client.user?.id, 'client');

                        if (!user) {
                            return void message.reply({ content: 'Não pude localizar nenhum usuário com as informações fornecidas.' });
                        } else if (!clientData) {
                            return void message.reply({ content: `Erro ao obter os dados do \`${this.client.user?.username}\`. Tente novamente mais tarde.` });
                        } else if (!clientData.blacklist.some((id) => user.id === id)) {
                            return void message.reply({ content: `O usuário \`${user.tag}\` não se encontra em minha lista negra.` });
                        } else {
                            await clientData.updateOne({ $pull: { blacklist: user.id } }, { new: true });

                            return void message.reply({ content: `O usuário \`${user.tag}\` foi removido(a) com sucesso da minha lista negra.` });
                        }
                    }
                }
                break;
            }
        }
    }
}
