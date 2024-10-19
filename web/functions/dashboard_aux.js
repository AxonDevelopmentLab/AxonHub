function formatDuration(seconds) {
    if (seconds === -1) return 'Vitalício';

    seconds = seconds - (Date.now() / 1000) - 32;
    if (seconds < 0) seconds = Math.abs(seconds);
    
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    const remainingSeconds = Math.floor(seconds % 60);

    let result = [];
    if (years > 0) result.push(`${years} ano${years > 1 ? 's' : ''}`);
    if (remainingDays > 0) result.push(`${remainingDays} dia${remainingDays > 1 ? 's' : ''}`);
    if (remainingHours > 0) result.push(`${remainingHours} hora${remainingHours > 1 ? 's' : ''}`);
    if (remainingMinutes > 0) result.push(`${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''}`);
    if (remainingSeconds > 0 || result.length === 0) result.push(`${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`);

    return result.join(', ');
}

function formulary(ObjectSettings) {
    for (const ID in [0, 1, 2, 3]) {
        document.getElementById('InputField' + ID + 'DIV').style.display = "none";
        document.getElementById('InputField' + ID).value = "";
    };

    for (const ID in ObjectSettings.InputFields) {
        document.getElementById('InputField' + ID + 'DIV').style.display = "block";
        const getInputField = document.getElementById('InputField' + ID);
        const TYPE = ObjectSettings.InputFields[ID].type;
        const PLACEHOLDER = ObjectSettings.InputFields[ID].placeholder;
        getInputField.type = TYPE;
        getInputField.placeholder = PLACEHOLDER;
    }

    document.getElementById('button').innerHTML = ObjectSettings.Button.text;
    document.getElementById('button').onclick = () => ObjectSettings.Button.callback();
    document.getElementById('dashboard.formulary').style.display = "block";
}

function disconnectDevice(SessionID) {
    $.post(`https://axon-api.glitch.me/account/close_session`, {
        token: localStorage.getItem('auth_token'),
        session_id: SessionID
    }).done(function (data) {
        if (data.status === 401) { localStorage.removeItem('auth_token'); redirect('account'); };
        if (data.status === 200) return updateDashboardStatus();
        return changeCategory('disconnect');
    }).fail(function (failed) {
        return changeCategory('disconnect');
    })
}

function connections(Service, ConnectionName) {
  $.post(`https://axon-api.glitch.me/connections/${ConnectionName}/${Service}`, {
    token: localStorage.getItem('auth_token')
  }).done(function (data) {
    if (data.message) alert(data.message);
    updateDashboardStatus()
  }).fail(function (failed) {
    updateDashboardStatus() 
  });
}

let interval = undefined;
function formularyCallback(Content) {
    document.getElementById('dashboard.formulary.callback').innerHTML = Content;
    if (interval !== undefined) clearInterval(interval);
    interval = setInterval(() => {
        clearInterval(interval);
        document.getElementById('dashboard.formulary.callback').innerHTML = '<br>';
        interval = undefined;
    }, 5000);
};
