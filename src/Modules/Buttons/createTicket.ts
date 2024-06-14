import { Ryuzaki } from '../../RyuzakiClient';
import { ModuleStructure, ClientEmbed } from '../../Structures/';
import { ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, ButtonInteraction, ButtonStyle, TextChannel } from 'discord.js';

export default class createTicketButton extends ModuleStructure {
    constructor(client: Ryuzaki) {
        super(client);
    }

    async moduleExecute(interaction: ButtonInteraction) {
        try {
            if (interaction.guild) {
                const user = await this.client.getData(interaction.user.id, 'user');
                const guild = await this.client.getData(interaction.guild.id, 'guild');

                if (user.ticket.have) {
                    return void interaction.reply({ content: `${interaction.user}, você já possui um **ticket** aberto.`, ephemeral: true });
                } else if (!guild.ticket.staff) {
                    return void interaction.reply({ content: 'Não é possível utilizar este comando pois não há um cargo de ticket definido neste servidor.', ephemeral: true });
                } else if (!guild.ticket.category) {
                    return void interaction.reply({ content: 'Não é possível utilizar este comando pois não há uma categoria de ticket definida neste servidor.', ephemeral: true });
                }

                const categoryID = interaction.customId.split('-')[1];
                const tch = interaction.guild.channels.cache.get(guild.ticket.category);

                if (!tch) {
                    return void interaction.reply({ content: 'Há uma categoria de ticket definida neste servidor porém ela não existe mais, peça para algum administrador atualiza-la no BOT.' });
                } else {
                    interaction.reply({ content: `${interaction.user}, estou criando seu ticket, aguarde um momento..`, ephemeral: true });

                    const channel = await interaction.guild.channels.create({
                        name: `${guild.ticket.size + 1}-${interaction.user.tag}`,
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
                                id: guild.ticket.staff,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
                            }
                        ]
                    });
                    const roleStaff = interaction.guild.roles.cache.get(guild.ticket.staff);
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

                    channel.send({ content: `${interaction.user} ${roleStaff}`, embeds: [criado], components: [row] });

                    user.set({
                        'ticket.have': true,
                        'ticket.channel': channel.id,
                        'ticket.created': Date.now()
                    });
                    user.save();

                    guild.set('ticket.size', guild.ticket.size + 1);
                    guild.save();

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

                    if (guild.logs.status && guild.logs.moderation) {
                        const channel = interaction.guild.channels.cache.get(guild.logs.channel) as TextChannel;
                        channel.send({ embeds: [opened], components: [to] }).catch(() => undefined);
                    }

                    interaction.followUp({ content: `${interaction.user}, o seu ticket foi criado com sucesso no canal: ${channel}`, ephemeral: true });
                }

                guild.set({
                    'ticket.msg': categoryID,
                    'ticket.channel': interaction.channel?.id,
                    'ticket.guild': interaction.guild.id
                });
                guild.save();
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, createTicketButton.name);
            this.client.logger.warn((err as Error).stack!, createTicketButton.name);
        }
    }
}