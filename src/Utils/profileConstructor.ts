import { ModuleStructure } from '../Structures';
import { UserDocument } from '../Types/SchemaTypes';
import { Interaction, Message, User } from 'discord.js';
import { loadImage, createCanvas, Canvas } from '@napi-rs/canvas';
import { emojis } from './Objects/emojis';
import Day from 'dayjs';
import { Abbrev } from './abbrev';
import { Util } from './util';

class profileConstructor extends ModuleStructure<Canvas> {
    async moduleExecute({ user, data, message }: { user: User, data: UserDocument, message: Message | Interaction }) {
        //========================// Criando canvas //========================//

        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        //========================// Importar Avatar //========================//

        const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 4096 }));
        ctx.drawImage(avatar, 5, 450, 150, 150);

        //========================// Importar Fundo //========================//

        const layout = './src/Assets/img/png/Profile_Card.png';
        const back = await loadImage(layout);
        ctx.drawImage(back, 0, 0, 800, 600);

        //========================// Textos //========================//

        // Username:
        ctx.textAlign = 'left';
        ctx.font = '35px KGWhattheTeacherWants';
        ctx.fillStyle = 'rgb(1, 1, 1)';
        await Util.renderEmojis(ctx, Util.trim( user.username, 20 ), 172, 510);

        // Medalhas:

        /*const ring = await loadImage('./Assets/img/png/ring.png');
         const crown = await loadImage('./Assets/img/png/crown.png');
         const robot = await loadImage('./Assets/img/png/robot.png')
 
         if (user.marry.has) {
             ctx.drawImage(ring, 190, 446, 30, 30);
         }
 
         if (USER.id === message.guild.ownerId) {
             if (user.marry.has) {
                 ctx.drawImage(crown, 220, 446, 30, 30);
             } else {
                 ctx.drawImage(crown, 190, 446, 30, 30);
             }
         }
 
         if (USER.bot) {
             if (USER.id === message.guild.ownerId) {
                 if (user.marry.has) {
                     ctx.drawImage(robot, 250, 446, 30, 30);
                 } else {
                     ctx.drawImage(robot, 220, 446, 30, 30);
                 }
             } else {
                 ctx.drawImage(robot, 190, 446, 30, 30);
             }
         }*/

        // Medalhas:
        type Flags = Record<string, string>;

        const flags: Flags = {
            Bot: emojis.bot,
            Member: emojis.cowboy,
            ClientDeveloper: emojis.dev,
            GuildOwner: emojis.guildOwner,
            Married: emojis.married,
            Vip: emojis.vip,
            HypeSquadOnlineHouse1: emojis.bravery,
            HypeSquadOnlineHouse2: emojis.balance,
            HypeSquadOnlineHouse3: emojis.brilliance,
            ActiveDeveloper: emojis.activeDeveloper
        };

        const list: string[] | undefined = user.flags?.toArray();

        if (list?.length) {
            const array: string[] = Object.values(flags);
            const { id } = user;
            const { marry, vip } = data;
            const guildOwnerId = message.guild?.ownerId;

            if (marry.has) list.push('Married');
            if (id === process.env.OWNER_ID) list.push('Developer');
            if (id === guildOwnerId) list.push('GuildOwner');
            if (vip.status) list.push('Vip');

            const filteredFlags = array.filter(flag => {
                const key = Object.keys(flags).find(key => flags[key] === flag);
                return key !== undefined && list.includes(key);
            });
            const renderedFlags = filteredFlags.join(' ');

            ctx.font = '30px KGWhattheTeacherWants';
            await Util.renderEmojis(ctx, renderedFlags, 200, 473);
        }


        //Reputações:
        const rep = data.reps;
        const receivedReps = rep.array.filter((rep) => rep.user === user.id).length;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgb(1, 1, 1)';
        ctx.font = '45px KGWhattheTeacherWants';
        ctx.fillText(receivedReps === 0 ? '0 REPS' : `${receivedReps} REPS`,
            660, 484
        );

        // Coins/XP
        const level = data.exp.level;
        const nextLevel = data.exp.nextLevel * level;

        ctx.textAlign = 'left';
        ctx.font = '20px KGWhattheTeacherWants';
        ctx.fillStyle = 'rgb(1, 1, 1)';
        ctx.fillText(new Abbrev(data.economy.coins + data.economy.bank).toString(), 580, 540);
        ctx.fillText('#' + data.exp.level + ' | ' + new Abbrev(data.exp.xp).toString() + '/' + new Abbrev(nextLevel).toString(), 580, 585);

        // Sobre
        ctx.font = '25px KGWhattheTeacherWants';
        ctx.fillStyle = 'rgb(1, 1, 1)';
        await Util.renderEmojis(ctx, data.about ? (data.about.match(/.{1,30}/g) ?? []).join('\n') : 'Altere o seu \'sobre mim\' clicando no botão abaixo.', 170, 535);

        // Títulos:
        ctx.textAlign = 'left';
        ctx.font = '30px KGWhattheTeacherWants';
        ctx.fillStyle = 'rgb(1, 1, 1)';
        ctx.fillText('Dinheiro:', 580, 520);
        ctx.fillText('XP:', 580, 565);
        ctx.textAlign = 'center';
        ctx.font = '25px KGWhattheTeacherWants';

        if (data.marry.has) {
            const alma = await this.client.users.fetch(data.marry.user).then(x => x.tag);
            let tempo = Day.duration(Date.now() - data.marry.time).format('M [meses] d [dias] h [horas] m [minutos] e s [segundos]').replace('minsutos', 'minutos');

            if (tempo.includes('dias')) {
                tempo = Day.duration(Date.now() - data.marry.time).format('M [meses] d [dias] h [horas] e m [minutos]').replace('minsutos', 'minutos"');
            }

            ctx.rotate(0.15);
            ctx.fillText('Casado(a) com:', 600, 20);
            ctx.fillText(`Há ${tempo}`, 600, 60);
            ctx.fillText(alma, 600, 40);
        }

        return canvas;
    }
}

export { profileConstructor };