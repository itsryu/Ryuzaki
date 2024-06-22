import { Ryuzaki } from '../../RyuzakiClient';
import { ListenerStructure, ClientEmbed } from '../../Structures/';
import { Events, GuildMember, PermissionFlagsBits, TextChannel } from 'discord.js';
import Day from 'dayjs';

export default class guildMemberAddListener extends ListenerStructure {
    constructor(client: Ryuzaki) {
        super(client, {
            name: Events.GuildMemberAdd
        });
    }

    async eventExecute(member: GuildMember) {
        try {
            const guild = member.guild;
            const guildData = await this.client.getData(guild.id, 'guild');

            if (guildData && guildData.antifake.status) {
                const kick = new ClientEmbed(this.client)
                    .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                    .addFields(
                        {
                            name: ':point_right: Ação:',
                            value: '`Expulsão automática`'
                        },
                        {
                            name: ':bust_in_silhouette: Membro:',
                            value: `\`${member.user.tag}\``,
                            inline: true
                        },
                        {
                            name: ':id: ID do Membro:',
                            value: `\`${member.user.id}\``,
                            inline: true
                        },
                        {
                            name: ':man_police_officer: Staffer:',
                            value: `\`${this.client.user?.tag}\``
                        },
                        {
                            name: ':scroll: Motivo(s):',
                            value: `Membro expulso pelo sistema anti-fake, essa conta foi criada faz: ***\`${Day(new Date()).diff(member.user.createdAt, 'days')} dias\`***`
                        });

                const kickado = new ClientEmbed(this.client)
                    .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 4096 }))
                    .setTitle('Você foi expulso(a)! 😔')
                    .setDescription(`Olá, \`${member.user.username}\`, infelizmente você foi expulso(a) do servidor \`${guild.name}\` pelo \`sistema anti-fake\`, a sua conta foi criada faz ***\`${Day(new Date()).diff(member.user.createdAt, 'days')} dias\`*** e você deve ter mais de ***\`${guildData.antifake.days} dias\`*** de criação de conta para entrar neste servidor.`);

                const timeAccount = Day(new Date()).diff(member.user.createdAt, 'days');
                const minimumDays = guildData.antifake.days;

                if (timeAccount < minimumDays) {
                    if (guildData.logs.status && guildData.logs.moderation) {
                        const channel = guild.channels.cache.get(guildData.logs.channel) as TextChannel;

                        channel.send({ embeds: [kick] });
                    }

                    member.send({ embeds: [kickado] }).catch(() => undefined);
                    member.kick('Membro expulso pelo sistema anti-fake.').catch(() => undefined);
                }
            }

            if (guildData && guildData.logs.status && guildData.logs.invites) {
                if (guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
                    const newInvites = await guild.invites.fetch();
                    const cachedInvites = this.client.invites.get(member.guild.id);

                    if (cachedInvites) {
                        const usedInvite = newInvites.find((inv) => {
                            const invite = cachedInvites.get(inv.code);
                            return invite?.uses && inv.uses ? invite.uses < inv.uses : false;
                        });

                        if (usedInvite) {
                            const embed = new ClientEmbed(this.client)
                                .setURL(`https://discord.gg/${usedInvite?.code}`)
                                .setDescription(`Seja bem-vindo(a) \`${member.user.tag}\`, convidado(a) por \`${usedInvite.inviter?.username}\`.\nNº de usos: **${usedInvite.uses}**`)
                                .setFooter({ text: guild.name });

                            newInvites.each((inv) => cachedInvites.set(inv.code, inv));
                            this.client.invites.set(guild.id, cachedInvites);

                            const channel = guild.channels.cache.get(guildData.logs.channel) as TextChannel;
                            channel.send({ embeds: [embed] });
                        }
                    }
                }
            }

            /*if (guildDb.welcome.status) {
                client.channels.cache.get(guildDb.welcome.channel).send(
                    guildDb.welcome.msg
                        .replace(/{member}/g, `<@${member.id}>`)
                        .replace(/{name}/g, `${member.user.username}`)
                        .replace(/{total}/g, guild.memberCount)
                        .replace(/{guildName}/g, guild.name)
                );
            }*/

            /*if (guildDb.autorole.status) {
                member.roles.add(guildDb.autorole.roles, "Sistema de autorole");
            }*/

            if (guildData && guildData.serverstats.status) {
                const st = guildData.serverstats;
                const ch = st.channels;

                if (ch.total != null) {
                    const channel = guild.channels.cache.get(ch.total) as TextChannel;

                    channel.setName(`Total: ${guild.memberCount.toLocaleString()}`);
                }

                if (ch.bot != null) {
                    const channel = guild.channels.cache.get(ch.bot) as TextChannel;

                    channel.setName(`Bots: ${guild.members.cache.filter((x) => x.user.bot).size.toLocaleString()}`);
                }

                if (ch.users != null) {
                    const channel = guild.channels.cache.get(ch.users) as TextChannel;

                    channel.setName(`Membros: ${guild.members.cache.filter((x) => !x.user.bot).size.toLocaleString()}`);
                }
            }

            if (guildData && guildData.counter.status) {
                (this.client.channels.cache.get(guildData.counter.channel) as TextChannel).setTopic(guildData.counter.msg.replace(/{members}/g, this.client.utils.counter(guild.memberCount)).replace(/{guild}/g, guild.name));
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, guildMemberAddListener.name);
            this.client.logger.warn((err as Error).stack!, guildMemberAddListener.name);
        }
    }
}