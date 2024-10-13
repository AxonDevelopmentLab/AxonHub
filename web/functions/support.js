let interval = undefined;
function sendMessage(Content) {
    document.getElementById('ticket.callback').innerHTML = Content;
    if (interval !== undefined) clearInterval(interval);
    interval = setInterval(() => {
        clearInterval(interval);
        document.getElementById('ticket.callback').innerHTML = '<br>';
        interval = undefined;
    }, 5000);
};

function sendTicket() {
    const FULLNAME = document.getElementById('ticket.fullname').value;
    const EMAIL = document.getElementById('ticket.email').value;
    const CATEGORY = document.getElementById('ticket.category').value;
    const TITLE = document.getElementById('ticket.title').value;
    const CONTENT = document.getElementById('ticket.content').value;

    if (!FULLNAME) return sendMessage('Nome inválido.');
    if (!EMAIL) return sendMessage('Email inválido.');
    if (!EMAIL.includes('@')) return sendMessage('Email inválido.');
    if (!TITLE) return sendMessage('Você precisa definir um título para o seu ticket.');
    if (!CONTENT) return sendMessage('Você necessita definir o conteúdo do seu ticket.');

    const generateTicketRequest = {
        contact: {
            name: FULLNAME,
            email: EMAIL
        },
        ticket: {
            category: CATEGORY,
            title: TITLE,
            content: CONTENT
        }
    }

    document.getElementById('ticket.fullname').value = '';
    document.getElementById('ticket.email').value = '';
    document.getElementById('ticket.title').value = '';
    document.getElementById('ticket.content').value = '';

    $.post(`https://axon-api.glitch.me/support/ticket`, generateTicketRequest).done(function (data) {
        return sendMessage(data.message);
    }).fail(function (failed) {
        return sendMessage('O servidor está fora de ar!<br><b onclick="window.location.href=`https://axonhub.glitch.me/status/`">https://axonhub.glitch.me/status/</b>');
    });
}