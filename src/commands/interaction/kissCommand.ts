import { Ryuzaki } from '../../ryuzakiClient';
import { CommandStructure, ClientEmbed } from '../../structures';
import { Message, MessageReaction, OmitPartialGroupDMChannel, User } from 'discord.js';
import { KissCommandData } from '../../data/commands/interaction/kissCommandData';
import { Logger } from '../../utils';

interface KissData {
    url: string
}

export default class KissCommand extends CommandStructure {
    constructor(client: Ryuzaki) {
        super(client, KissCommandData);
    }

    public async commandExecute({ message, args }: { message: OmitPartialGroupDMChannel<Message>, args: string[] }) {
        try {
            const member = message.mentions?.members?.first() ?? message.guild?.members.cache.get(args[0]);

            if (!member) {
                return void await message.reply({ content: 'Você deve `mencionar o usuário` que você deseja beijar.' });
            } else if (member.user.id === message.author.id) {
                return void await message.reply({ content: 'Você não pode beijar a si próprio, mencione `outro usuário`.' });
            } else if (member.user.bot) {
                return void await message.reply({ content: 'Você não pode beijar um BOT, mencione `outro usuário`.' });
            } else {
                const data = await fetch('https://nekos.life/api/v2/img/kiss')
                    .then(res => res.json())
                    .catch(() => undefined) as KissData | undefined;

                if (data) {
                    const embed = new ClientEmbed(this.client)
                        .setColor(0xff7892)
                        .setDescription(`**${message.author} beijou ${member}!**`)
                        .setImage(data.url)
                        .setFooter({ text: 'Reaja com 😘 para retribuir ou 😡 para dar um tapa.' });

                    const msg = await message.reply({ embeds: [embed] });
                    await msg.react('😘');
                    await msg.react('😡');

                    const filter = (r: MessageReaction, u: User) => r.message.id === msg.id && u.id === member.user.id;
                    const collector = msg.createReactionCollector({ filter, time: 60000, max: 1 });

                    collector.on('end', async () => {
                        await msg.reactions.removeAll();
                    });

                    collector.on('collect', async (r) => {
                        if (r.emoji.name === '😘') {
                            const data = await fetch('https://nekos.life/api/v2/img/kiss')
                                .then(res => res.json())
                                .catch(() => undefined) as KissData | undefined;

                            if (data) {
                                embed.setColor(0Xff7892);
                                embed.setDescription(`**${member} retribuiu o beijo de ${message.author} com outro beijo!**`);
                                embed.setImage(data.url);
                                embed.setFooter({ text: '😊' });

                                await msg.edit({ embeds: [embed] });
                            } else {
                                return void await message.reply({ content: 'Erro ao obter a imagem. Tente novamente mais tarde.' });
                            }
                        }

                        if (r.emoji.name === '😡') {
                            const data = await fetch('https://nekos.life/api/v2/img/slap')
                                .then(res => res.json())
                                .catch(() => undefined) as KissData | undefined;

                            if (data) {
                                embed.setColor(0xFF0000);
                                embed.setDescription(`**${member} odiou o beijo de ${message.author} e retribuiu com um tapa!**`);
                                embed.setImage(data.url);
                                embed.setFooter({ text: 'Eu não faria isso novamente..' });

                                await msg.edit({ embeds: [embed] });
                            } else {
                                return void await message.reply({ content: 'Erro ao obter a imagem. Tente novamente mais tarde.' });
                            }
                        }

                        return void await r.users.remove(member.id);
                    });
                } else {
                    return void await message.reply({ content: 'Erro ao obter a imagem. Tente novamente mais tarde.' });
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, KissCommand.name);
            Logger.warn((err as Error).stack, KissCommand.name);
            throw new Error((err as Error).message, { cause: err });
        }
    }
}