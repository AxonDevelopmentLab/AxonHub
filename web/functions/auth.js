const currentUrl = new URL(window.location.href);
const params = new URLSearchParams(currentUrl.search);
const changetype_params = params.get('changetype');
const message_params = params.get('message');
const redirect_param = params.get('redirectTo');
let redirect_content = params.get('passContent');
if (redirect_content) redirect_content = redirect_content.split(',');

if (redirect_param === null) {
    if (localStorage.getItem('auth_token')) {
      redirect('account/dashboard');
    } else {
      document.getElementById('page').style.visibility = 'visible';
    }
} else {
    document.getElementById('page').style.visibility = 'visible';
}

let cache_typeOf = 'register';

let interval = undefined;
function sendMessage(Content, Time = 5000) {
    document.getElementById('callback.text').innerHTML = Content;
    if (interval !== undefined) clearInterval(interval);
    interval = setInterval(() => {
        clearInterval(interval);
        document.getElementById('callback.text').innerHTML = '<br>';
        interval = undefined;
    }, Time);
};

const MessagePresets = {
    'PRESET_01': 'Faça o login na conta na qual<br>você deseja vincular o Discord.'
};

if (message_params !== null) {
    if (Object.keys(MessagePresets).includes(message_params)) { sendMessage(MessagePresets[message_params])
    } else { sendMessage(message_params); }
};  

const USERNAME = document.getElementById('username');
const EMAIL = document.getElementById('email');
const PASSWORD = document.getElementById('password');
const CONFIRM_PASSWORD = document.getElementById('confirm.password');

function auth() {
    if (!USERNAME.disabled && !USERNAME.value) return sendMessage('Nome de usuário inválido.');
    if (!USERNAME.disabled && USERNAME.length < 4) return sendMessage('Nome de usuário precisa conter no mínimo 4 caracteres.');
    if (!EMAIL.value) return sendMessage('Email inválido.');
    if (!EMAIL.value.includes('@')) return sendMessage('Email inválido.');
    if (!PASSWORD.value) return sendMessage('Senha inválida.');
    if (PASSWORD.value.length < 8) return sendMessage('A senha precisa conter no mínimo 8 caracteres.');
    if (!CONFIRM_PASSWORD.disabled && CONFIRM_PASSWORD.value !== PASSWORD.value) return sendMessage('As senhas não batem.');

    let GenerateAuthObject = {
        username: USERNAME.value,
        email: EMAIL.value,
        password: PASSWORD.value,
        confirm_password: CONFIRM_PASSWORD.value
    };

    if (USERNAME.disabled) delete GenerateAuthObject['username'];
    if (CONFIRM_PASSWORD.disabled) delete GenerateAuthObject['confirm_password'];
  
    USERNAME.value = "";
    EMAIL.value = "";
    PASSWORD.value = "";
    CONFIRM_PASSWORD.value = "";
  
    sendMessage('Aguarde...', (60000 * 5));

    $.post(`https://axon-api.glitch.me/auth/${cache_typeOf}`, GenerateAuthObject).done(function (data) {
        if (data.status === 400) return sendMessage(data.message);
        localStorage.setItem('auth_token', data.auth_pass);

        if (redirect_param !== null) {
            let first_param = true;
            let url = redirect_param + '?';

            const acceptedParaments = {
                "id": () => {
                    if (!first_param) url = url + '&';
                    url += `id=${data.account_id}`;
                    first_param = false;
                },
                "code": () => {
                    if (!first_param) url = url + '&';
                    url += `code=${params.get('code')}`;
                    first_param = false;
                }
            };

            if (redirect_content) for (const content of redirect_content) try { acceptedParaments[content]() } catch (err) { undefined };
            window.location.href = url;
        } else {
            location.reload();
        }
    }).fail(function (failed) {
        return sendMessage('O servidor está fora de ar!<br><b onclick="window.location.href=`https://axonhub.glitch.me/status/`">https://axonhub.glitch.me/status/</b>');
    })
}

USERNAME.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); auth(); } });
EMAIL.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); auth(); } });
PASSWORD.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); auth(); } });
CONFIRM_PASSWORD.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); auth(); } });

function changeType() {
    const TITLE = document.getElementById('title');
    const SUBMESSAGE = document.getElementById('submessage');
    const BUTTON = document.getElementById('button.action');
    if (cache_typeOf === 'login') {
        TITLE.innerHTML = 'Crie a sua Conta';
        USERNAME.style.opacity = 1; USERNAME.value = ''; USERNAME.disabled = false;
        CONFIRM_PASSWORD.style.opacity = 1; CONFIRM_PASSWORD.value = ''; CONFIRM_PASSWORD.disabled = false;
        CONFIRM_PASSWORD.style.display = 'block';
        SUBMESSAGE.innerHTML = 'Já tem uma conta?<br>Clique <b onclick="changeType()">aqui</b> para entrar na sua conta.';
        BUTTON.innerHTML = 'CRIAR';
        cache_typeOf = 'register';
    } else {
        TITLE.innerHTML = '&nbsp;Entre na Conta';
        USERNAME.style.opacity = 0.1; USERNAME.value = ''; USERNAME.disabled = true;
        CONFIRM_PASSWORD.style.opacity = 0.1; CONFIRM_PASSWORD.value = ''; CONFIRM_PASSWORD.disabled = true;
        SUBMESSAGE.innerHTML = 'Não tem uma conta?<br>Clique <b onclick="changeType()">aqui</b> para criar a sua conta.';
        BUTTON.innerHTML = 'ENTRAR';
        cache_typeOf = 'login';
    }
}

if (changetype_params !== null) changeType();
document.getElementById('button.action').addEventListener('click', (e) => { e.preventDefault(); auth() });