import { EmbedBuilder, Message } from 'discord.js';

export default {
    register: () => {
        return new EmbedBuilder()
            .setColor(0x97c708)
            .setTitle('Para finalizar:')
            .setDescription('Você leu e está de acordo com as <#741167183077572629> do servidor? \n> 🪐・Sim, eu li e estou ciente de tudo.\n> ❌・Não, eu não estou nem aí para regras.');
    },

    welcome: () => {
        return new EmbedBuilder()
            .setColor(0xe93f68)
            .setTitle('<a:saturn:897989207518236672> **Fluxo** <a:saturn:897989207518236672>')
            .setDescription('Oii, bem-vindo(a) ao Fluxo! Somos um servidor com o intuito de recepcionar e mediar as pessoas à criarem **novas amizades**; além de, também, oferecer um **ambiente organizado**, **tranquilo** e **acolhedor** para conversar, jogar, ouvir música ou apenas passar um pouquinho do tempo. <a:pink_heart:897992360842121256>')
            .addFields(
                {
                    name: '**__Alguns canais importantes antes de tudo:__**',
                    value: '> <a:setinha_direita:897984385750556692> Leia as <#741167183077572629>, é de suma importância para evitar quaisquer problemas.\n> <a:setinha_direita:897984385750556692> Se registre no servidor utilizando o canal de <#741224260235952220>.'
                },
                {
                    name: '**__Outros canais para você:__**',
                    value: '> <a:setinha_direita:897984385750556692> Interaja com outros membros utilizando o <#897981879997857812>.\n> <a:setinha_direita:897984385750556692> Informações sobre as vantagens de ser um <@&749162627795517442> em <#856917508615438346>.\n> <a:setinha_direita:897984385750556692> Seja um <@&809126231991517204>! Faça o seu formulário em <#859232386737766410>.\n> <a:setinha_direita:897984385750556692> Requisitos para se tornar um <@&756086625641168947> no canal <#744477243950235739>.'
                },
                {
                    name: '\u200B',
                    value: ':link: **__Convide seus amigos!__**\nQuer compartilhar o servidor com seus amigos? Ou apenas ter o link salvo? Cá está um link permanente: [Clique aqui!](https://discord.gg/c9NMjQGC3e)'
                },
                {
                    name: '\u200B',
                    value: ':sparkling_heart:   **__Seja bem-vindo(a) ao Fluxo!__**  :sparkling_heart:'
                })
            .setImage('https://i.imgur.com/IBKFqyV.gif');
    },

    form: (message: Message) => {
        return new EmbedBuilder()
            .setColor(0x734bbd)
            .setTitle('<:form:868572794458353674> ***Formulário - STAFF*** ')
            .setDescription('Para aqueles que têm interesse em se ingressar para a STAFF, responda este formulário.')
            .addFields(
                {
                    name: '<:pontodeinterrogacao:812108690764333057> E como faço o formulário?',
                    value: 'Utilize o comando `/form` no canal <#741224264170078260> onde será aberto um questionário na sua DM.'
                },
                {
                    name: 'Obs:',
                    value: '<a:setinha:755029958283362387> Você deve ser registrado no servidor; \n\n<a:setinha:755029958283362387> A sua **DM deve estar aberta** para que você possa responder o questionário; \n\n<a:setinha:755029958283362387> Leve este formulário a **sério**. Quaisquer respostas com tom de brincadeira ou infantilidade serão desconsideradas e o usuário passível à penalidade.'
                },
                {
                    name: '\u200B',
                    value: 'Caso **aprovado pela nossa equipe**, entraremos em **contato** com você.'
                },
                {
                    name: '\u200B',
                    value: '**__Atenciosamente, equipe F.P.__**'
                })
            .setImage('https://cdn.discordapp.com/attachments/857006185545728030/870108536229728316/Formulario_Fluxo.gif')
            .setFooter({ text: `2022 © ${message.guild?.name}` });
    },

    partner: (message: Message) => {
        return new EmbedBuilder()
            .setColor(0x3f85ea)
            .setThumbnail(message.guild?.iconURL({ extension: 'png', size: 4096 }) ?? null)
            .setTitle('<:partner:845847698305318912> ***Parcerias*** <:partner:845847698305318912>')
            .setDescription('Você tem um servidor e deseja realizar uma parceria com o nosso? Veja quais são os requisitos mínimos para ser realizado a parceria e os compromissos que deverão ser seguidos em ambas as partes para a parceria ser mantida.')
            .addFields(
                {
                    name: '🔗 Requisitos:',
                    value: '> <a:setinha:755029958283362387> Ter pelo menos **50 membros** no servidor;\n> <a:setinha:755029958283362387> Possuir um **canal de parcerias** no servidor;\n> <a:setinha:755029958283362387> Ter pelo menos **1 representante** do seu servidor em nosso servidor;\n> <a:setinha:755029958283362387> Colocar **cargo de parceiro** no representante que estiver em seu servidor;\n> <a:setinha:755029958283362387> Colocar @everyone/@here ou **ping** próprio do servidor;'
                },
                {
                    name: '🤝 Compromissos:',
                    value: '> <a:setinha:755029958283362387> Caso o **representante saia**, a parceria será **desfeita**;\n> <a:setinha:755029958283362387> Convites que **expirarem** serão removidos.'
                },
                {
                    name: '<:atencaoo:810514406882279475> Observações:',
                    value: '<:mark_pin:880086258649546752> Se todos os requisitos estiverem de acordo e você deseja iniciar uma parceria você deverá chamar a <@483507949491453953> para realizar a parceria.'
                })
            .setFooter({ text: message.guild?.name! });
    },

    hot: () => {
        return new EmbedBuilder()
            .setColor(0xf7630c)
            .setTitle('<a:foguinho:900025472421871706> **Acesso +18** <a:foguinho:900025472421871706>')
            .setDescription('Para ter acesso ao **conteúdo +18 do servidor** leia essas informações:')
            .addFields(
                {
                    name: '\u200B',
                    value: '👀 **__Alguns cuidados:__**\n> <a:setinha_direita:897984385750556692> Estes canais são dedicados para pessoas <@&741178635393826896>, nós não nos responsabilizamos com o seu acesso a estes canais e sim com os conteúdos postados.\n> <a:setinha_direita:897984385750556692> Todo conteúdo de pessoas com <@&897820617636737035> nestes canais será removido e o usuário será banido permanentemente do servidor.'
                },
                {
                    name: '\u200B',
                    value: '<a:foguinho:900025472421871706> **__Acessando:__**\nSe você **leu** e **está de acordo** com essas informações e quer ter o <@&757616985818267848> reaja no emoji abaixo (🔥) para ter o acesso.'
                })
            .setImage('https://i.imgur.com/TtyCwVc.gif');
    }
};
