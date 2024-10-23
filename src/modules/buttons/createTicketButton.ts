import { ModuleStructure, ClientEmbed } from '../../structures';
import { ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, ButtonInteraction, ButtonStyle, TextChannel } from 'discord.js';
import { Logger } from '../../utils';

export default class CreateTicketButton extends ModuleStructure {
    async moduleExecute(interaction: ButtonInteraction) {
        try {
            if (interaction.guild) {
                const userData = await this.client.getData(interaction.user.id, 'user');
                const guildData = await this.client.getData(interaction.guild.id, 'guild');

                if (!userData || !guildData) {
                    return void await interaction.reply({ content: 'Erro ao obter os dados do banco de dados. Tente novamente mais tarde.' });
                } else if (userData.ticket.have) {
                    return void await interaction.reply({ content: `${interaction.user}, você já possui um **ticket** aberto.`, ephemeral: true });
                } else if (!guildData.ticket.staff) {
                    return void await interaction.reply({ content: 'Não é possível utilizar este comando pois não há um cargo de ticket definido neste servidor.', ephemeral: true });
                } else if (!guildData.ticket.category) {
                    return void await interaction.reply({ content: 'Não é possível utilizar este comando pois não há uma categoria de ticket definida neste servidor.', ephemeral: true });
                } else {
                    const categoryID = interaction.customId.split('-')[1];
                    const tch = interaction.guild.channels.cache.get(guildData.ticket.category);

                    if (!tch) {
                        return void await interaction.reply({ content: 'Há uma categoria de ticket definida neste servidor porém ela não existe mais, peça para algum administrador atualiza-la no BOT.' });
                    } else {
                        await interaction.reply({ content: `${interaction.user}, estou criando seu ticket, aguarde um momento..`, ephemeral: true });

                        const channel = await interaction.guild.channels.create({
                            name: `${guildData.ticket.size + 1}-${interaction.user.tag}`,
                            type: ChannelType.GuildText,
                            parent: tch.id,
                            permissionOverwrites: [
                                {
                                    id: interaction.user.id,
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
                                },
                                {
                                    id: interaction.guild.id,
                                    deny: [PermissionFlagsBits.ViewChannel]
                                },
                                {
                                    id: guildData.ticket.staff,
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
                                }
                            ]
                        });
                        const roleStaff = interaction.guild.roles.cache.get(guildData.ticket.staff);
                        const criado = new ClientEmbed(this.client)
                            .setThumbnail(interaction.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                            .setDescription(`${interaction.user}, aqui está seu **ticket**. Espere pelo atendimento da nossa equipe.`)
                            .setFields(
                                {
                                    name: 'Obs:',
                                    value: `・Este ticket é privado apenas **para você** e a **equipe do servidor** (${roleStaff}), fique a vontade para tratar de assuntos que **outros membros** não possam saber.\n・Quando você quiser **fechar** este ticket, basta clicar no botão abaixo.`
                                });

                        const close = new ButtonBuilder()
                            .setCustomId('close')
                            .setEmoji('💢')
                            .setLabel('Clique para fechar')
                            .setStyle(ButtonStyle.Danger);

                        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(close);

                        await channel.send({ content: `${interaction.user} ${roleStaff}`, embeds: [criado], components: [row] });

                        userData.set({
                            'ticket.have': true,
                            'ticket.channel': channel.id,
                            'ticket.created': Date.now()
                        });
                        await userData.save();

                        guildData.set('ticket.size', guildData.ticket.size + 1);
                        await guildData.save();

                        const opened = new ClientEmbed(this.client)
                            .setTitle('Um novo ticket foi aberto')
                            .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
                            .setDescription(`Um novo ticket foi aberto por ${interaction.user}.`);

                        const button = new ButtonBuilder()
                            .setLabel('Ir para o canal')
                            .setEmoji('📤')
                            .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
                            .setStyle(ButtonStyle.Secondary);

                        const to = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

                        if (guildData.logs.status && guildData.logs.moderation) {
                            const channel = interaction.guild.channels.cache.get(guildData.logs.channel) as TextChannel;
                            await channel.send({ embeds: [opened], components: [to] }).catch(() => undefined);
                        }

                        await interaction.followUp({ content: `${interaction.user}, o seu ticket foi criado com sucesso no canal: ${channel}`, ephemeral: true });
                    }

                    guildData.set({
                        'ticket.msg': categoryID,
                        'ticket.channel': interaction.channel?.id,
                        'ticket.guild': interaction.guild.id
                    });

                    await guildData.save();
                }
            }
        } catch (err) {
            Logger.error((err as Error).message, CreateTicketButton.name);
            Logger.warn((err as Error).stack, CreateTicketButton.name);
        }
    }
}