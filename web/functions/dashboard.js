let CACHE_currentDevicePage = 0;
let CACHE_currentPage = 'overview';
let CACHE;

const currentUrl = new URL(window.location.href);
const params = new URLSearchParams(currentUrl.search);
const menu_params = params.get('menu');

if (localStorage.getItem('auth_token')) {
    $.post(`https://axon-api.glitch.me/account/get`, { token: localStorage.getItem('auth_token'), services: ['account'] }).done(function (data) {
        if (data.status === 401) { localStorage.removeItem('auth_token'); redirect('account'); };
        if (data.status === 200) {
          CACHE = data.services;
          document.getElementById('menu').style.visibility = 'visible';
          if (menu_params) { changeCategory(menu_params); } else { changeCategory('overview'); }
        };
    }).fail(function (failed) { localStorage.removeItem('auth_token'); redirect('account'); })
} else { redirect('account') };

const TITLE = document.getElementById('dashboard.title');
const DESCRIPTION = document.getElementById('dashboard.description');

function formularySendHttp(Args) {
    $.post(`https://axon-api.glitch.me/account/management`, {
        token: localStorage.getItem('auth_token'),
        service: CACHE_currentPage,
        args: [
            document.getElementById('InputField0').value,
            document.getElementById('InputField1').value,
            document.getElementById('InputField2').value,
            document.getElementById('InputField3').value
        ]
    }).done(function (data) {
        if (data.status === 401) return allCategories['disconnect']();
        if (data.redirect) {
            allCategories['disconnect'](false);
            return window.location.href = data.redirect;
        };

        if (data.message) formularyCallback(data.message);
        updateDashboardStatus();
    }).fail(function (failed) { return allCategories['disconnect'](); })
}

const allCategories = {
    'overview': () => {
        TITLE.innerHTML = `Olá, seja bem-vindo(a) <b>${CACHE.account.username}</b>.`;
        DESCRIPTION.innerHTML = `Você está na Dashboard.<br><br><b>SEU USERNAME</b><br>${CACHE.account.username}<br><br><b>SEU E-MAIL</b><br>${CACHE.account.email}`;
    },
    'membership': () => {
        const CurrentPlan = CACHE.account.current_plan.substring(0, 1).toUpperCase() + CACHE.account.current_plan.substring(1, CACHE.account.current_plan.length);
        let Description = `<br><b>SEU PLANO ATUAL</b><br>${CurrentPlan}`;

        if (CACHE.account.current_plan !== 'free') Description += `<br><br><b>O SEU PLANO ACABA EM</b><br>${formatDuration(Number(CACHE.account.current_plan_expires_in))}`;

        TITLE.innerHTML = 'Sua Assinatura';
        DESCRIPTION.innerHTML = `${Description}<br><br>Adquira o <b>Axon Plus</b> por apenas <b>R$ 14.99</b>.<br>Clique <b onclick='redirect("store")'>aqui</b> para acessar a loja e ver os benefícios.`
    
        function loop(pagename) {
          setTimeout(() => {
            if (CACHE_currentPage === pagename) allCategories[pagename]();
          }, 1000)
        }; loop('membership');
    },
    'discord': () => {
        TITLE.innerHTML = 'Discord';

        let Description = 'Vincule o seu <b>Discord</b> com a AxonHub e ganhe recompensas!<br><br><b>Lista de Recompensas:</b><br>+15 Picks gratuítos no InstalockAPP<br><br>';
        if (CACHE.account.discord_username !== "") {
            Description += `<b>DISCORD VINCULADO</b><br>${CACHE.account.discord_username}<br><br>Clique <b onclick='connections("sync", "discord")'>aqui</b> para sincronizar os dados com o Discord.<br>Clique <b onclick='connections("unlink", "discord")'>aqui</b> para desvincular o Discord.`;
        } else {
            Description += `<b>Oops, nenhum Discord vinculado.</b><br>Você não tem nenhum Discord vinculado a sua conta.<br>Clique <b onclick='window.location.href="https://discord.com/oauth2/authorize?client_id=1274868905554481277&response_type=code&redirect_uri=https%3A%2F%2Faxonhub.glitch.me%2Faccount%3Fmessage%3DPRESET_01%26changetype%3Dtrue%26redirectTo%3Dhttps%3A%2F%2Faxon-api.glitch.me%2Fconnections%2Fdiscord%26passContent%3Did%2Ccode&scope=identify"'>aqui</b> para vincular o seu Discord e ganhar recompensas.`
        }

        DESCRIPTION.innerHTML = Description;
    },
    'devices': (page = 0) => {
        const MAX_PAGES = 3;
        const AvailablePages = Math.ceil(CACHE.account.alldevices.length / MAX_PAGES)

        if (page < 0) page = 0;
        if ((page + 1) > AvailablePages) page = AvailablePages - 1;

        let START = ((page + 1) * 3) - 3;
        const END = START + MAX_PAGES;
      
        CACHE_currentDevicePage = page;
  
        TITLE.innerHTML = 'Dispositivos Conectados';
        let Description = `Veja todos os seus dispositivos conectados.<br><br><div style="user-select:none; padding:5px; background-color: #312b40; border-radius: 15px"><b onclick="allCategories['devices'](${page - 1})">VOLTAR</b> │ <b onclick="allCategories['devices'](${page + 1})">PRÓXIMO</b> (${page + 1}/${AvailablePages})</div><br>`;
        let allDevices = "";
        for (const device of CACHE.account.alldevices.slice(START, END)) {
            allDevices += `<div style="border-radius: 20px; padding: 10px; margin: 0px; text-align: left; background-color: #312b40;"><b>Dispositivo:</b> ${device.Device}<br><b>Localização:</b> ${device.Location}<br><b>Última Atividade:</b> ${formatDuration(Number(device.lastTimeSeen))}<br>Clique <b onclick="disconnectDevice('${device.SessionID}')">aqui</b> para encerrar sessão.</div><br>`
        }

        Description += '<p style="font-size: 11px; padding-bottom:0px; padding-top:0px; padding:0px; margin:0px">' + allDevices + '</p>';
        DESCRIPTION.innerHTML = Description;

        function loop(pagename) {
          setTimeout(() => {
            if (CACHE_currentPage === pagename) allCategories[pagename](CACHE_currentDevicePage);
          }, 1000)
        }; loop('devices');
    },
    'changename': () => {
        TITLE.innerHTML = 'Alterar Nome de Usuário';
        DESCRIPTION.innerHTML = 'Preencha os dados abaixo para alterar o seu nme de usuário.'
        formulary({
            InputFields: [
                { type: 'text', placeholder: 'Novo nome de usuário' },
                { type: 'password', placeholder: 'Sua Senha' },
                { type: 'password', placeholder: 'Confirme a Sua Senha' }
            ],
            Button: {
                text: 'ALTERAR',
                callback: () => {
                    const NEW_NICKNAME = document.getElementById('InputField0').value;
                    const PASSWORD = document.getElementById('InputField1').value;
                    const CONFIRM_PASSWORD = document.getElementById('InputField2').value;

                    if (!NEW_NICKNAME) return formularyCallback('Defina o seu novo nome de usuário.');
                    if (NEW_NICKNAME.length < 4) return formularyCallback('O nome de usuário deve ter no mínimo 4 caracteres.');

                    if (!PASSWORD) return formularyCallback('Senha incorreta.');
                    if (PASSWORD.length < 8) return formularyCallback('Senha incorreta.');
                    if (CONFIRM_PASSWORD !== PASSWORD) return formularyCallback('As senhas não batem.')

                    formularySendHttp();
                }
            }
        })
    },
    'changepassword': () => {
        TITLE.innerHTML = 'Alterar Sua Senha';
        DESCRIPTION.innerHTML = 'Preencha os dados abaixo para alterar a sua senha.<br>Tal ação irá desconectar todos dispositivos conectados da sua conta.'
        formulary({
            InputFields: [
                { type: 'password', placeholder: 'Nova Senha' },
                { type: 'password', placeholder: 'Confirme a sua Nova Senha' },
                { type: 'password', placeholder: 'Sua Senha Antiga' }
            ],
            Button: {
                text: 'ALTERAR',
                callback: () => {
                    const NEW_PASSWORD = document.getElementById('InputField0').value;
                    const CONFIRM_NEW_PASSWORD = document.getElementById('InputField1').value;
                    const OLD_PASSWORD = document.getElementById('InputField2').value;

                    if (!NEW_PASSWORD) return formularyCallback('Defina a sua nova senha.');
                    if (NEW_PASSWORD.length < 8) return formularyCallback('A sua nova senha deve conter no mínimo 8 caracteres.');

                    if (NEW_PASSWORD !== CONFIRM_NEW_PASSWORD) return formularyCallback('As senhas não batem.')

                    if (!OLD_PASSWORD) return formularyCallback('Senha incorreta.');
                    if (OLD_PASSWORD.length < 8) return formularyCallback('Senha incorreta.');

                    formularySendHttp();
                }
            }
        })
    },
    'changeemail': () => {
        TITLE.innerHTML = 'Alterar o seu E-mail';
        DESCRIPTION.innerHTML = 'Preencha os dados abaixo para alterar o seu e-mail.<br><br>Tal ação irá desconectar todos dispositivos conectados da sua conta.<br>E você irá necessitar verificar novamente o seu e-mail.'
        formulary({
            InputFields: [
                { type: 'email', placeholder: 'Seu novo Email' },
                { type: 'password', placeholder: 'Sua Senha' },
                { type: 'password', placeholder: 'Confirme a Sua Senha' }
            ],
            Button: {
                text: 'ALTERAR',
                callback: () => {
                    const NEW_EMAIL = document.getElementById('InputField0').value;
                    const PASSWORD = document.getElementById('InputField1').value;
                    const CONFIRM_PASSWORD = document.getElementById('InputField2').value;

                    if (!NEW_EMAIL) return formularyCallback('Defina o seu novo email.');
                    if (!NEW_EMAIL.includes('@')) return formularyCallback('Email inválido.');

                    if (!PASSWORD) return formularyCallback('Senha incorreta.');
                    if (PASSWORD.length < 8) return formularyCallback('Senha incorreta.');
                    if (CONFIRM_PASSWORD !== PASSWORD) return formularyCallback('As senhas não batem.');

                    formularySendHttp();
                }
            }
        })
    },
    'accountdelete': () => {
        TITLE.innerHTML = 'Deletar a sua Conta';
        DESCRIPTION.innerHTML = 'Preencha os dados abaixo para deletar a sua conta.<br><br>Após clicar em deletar, a sua conta será suspensa por <b>7 Dias</b>.<br>Só após este prazo todos os seus dados irão ser deletados dos nossos banco de dados.<br>Durante esse período, você pode enviar um ticket para o suporte para reverter essa ação.'
        formulary({
            InputFields: [
                { type: 'password', placeholder: 'Sua Senha' },
                { type: 'password', placeholder: 'Confirme a Sua Senha' },
                { type: 'text', placeholder: 'Escreva "deletar" para confirmar.' }
            ],
            Button: {
                text: 'DELETAR',
                callback: () => {
                    const PASSWORD = document.getElementById('InputField0').value;
                    const CONFIRM_PASSWORD = document.getElementById('InputField1').value;
                    const CONFIRMATION_PHRASE = document.getElementById('InputField2').value;

                    if (!PASSWORD) return formularyCallback('Senha incorreta.');
                    if (PASSWORD.length < 8) return formularyCallback('Senha incorreta.');

                    if (CONFIRM_PASSWORD !== PASSWORD) return formularyCallback('As senhas não batem.');

                    if (!CONFIRMATION_PHRASE) return formularyCallback('Confirme a frase de segurança.');
                    if (CONFIRMATION_PHRASE !== "deletar") return formularyCallback('Frase de segurança incorreta.');

                    formularySendHttp();
                }
            }
        })
    },
    'disconnect': (Redirect = true) => {
        localStorage.removeItem('auth_token');
        if (Redirect) redirect('account');
    },
}

function changeCategory(newCategory) {
    const availableCategories = Object.keys(allCategories);
  
    document.getElementById('dashboard.formulary').style.display = "none";
    document.getElementById(CACHE_currentPage).style.color = '#ffffff';
  
    if (!availableCategories.includes(newCategory)) return allCategories['overview']();
    document.getElementById(newCategory).style.color = '#9a91b5';

    CACHE_currentPage = newCategory;
    return allCategories[`${newCategory}`]();
};

function updateDashboardStatus() {
    $.post(`https://axon-api.glitch.me/account/get`, { token: localStorage.getItem('auth_token'), services: ['account'] }).done(function (data) {
        if (data.status === 401) { localStorage.removeItem('auth_token'); redirect('account'); };
        if (data.status === 200) { CACHE = data.services; changeCategory(CACHE_currentPage); };
    }).fail(function (failed) { localStorage.removeItem('auth_token'); redirect('account'); });
}