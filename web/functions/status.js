const Statuses = [
    {
        Icon: 'https://cdn.glitch.global/7ad28ccd-58c1-41f4-b83f-e0c15c4569ec/WEBP_InstalockAPP.webp?v=1728108947358',
        Name: 'InstalockAPP',
        URL: 'https://raw.githubusercontent.com/AxonDevelopmentLab/AppsDetails/main/instalockapp.json'
    },
    {
        Icon: 'https://cdn.glitch.global/7ad28ccd-58c1-41f4-b83f-e0c15c4569ec/WEBP_AxonAPI.webp?v=1728108944471',
        Name: 'Axon API',
        URL: 'https://axon-api.glitch.me/'
    },
    {
        Icon: 'https://cdn.glitch.global/7ad28ccd-58c1-41f4-b83f-e0c15c4569ec/WEBP_AxonCDN.webp?v=1728108945025',
        Name: 'Axon CDN',
        URL: 'https://axon-cdn.glitch.me/'
    },
    {
        Icon: 'https://cdn.glitch.global/7ad28ccd-58c1-41f4-b83f-e0c15c4569ec/WEBP_AXSC.webp?v=1728108946799',
        Name: 'AXSC Int.',
        URL: 'https://axsc.glitch.me/'
    },
    {
        Icon: 'https://cdn.glitch.global/7ad28ccd-58c1-41f4-b83f-e0c15c4569ec/WEBP_AxonSync.webp?v=1728108946247',
        Name: 'Axon Sync',
        URL: 'https://axon-sync.glitch.me/'
    }
];

function setOffline(Element) {
    document.getElementById(`${Element}.div`).style.background = '#ff0000'
    document.getElementById(`${Element}.txt`).innerHTML = 'Offline'
}
  
function setOnline(Element) {
    document.getElementById(`${Element}.div`).style.background = '#37ff00'
    document.getElementById(`${Element}.txt`).innerHTML = 'Online'
}
  
function setMaintence(Element) {
    document.getElementById(`${Element}.div`).style.background = '#fff700'
    document.getElementById(`${Element}.txt`).innerHTML = 'Manutenção'
}

function getStatus() {
    for (const ID in Statuses) {
        const Object = Statuses[ID];
        const Element = `status.${Number(ID) + 1}`;

        document.getElementById(Element).style.visibility = "visible";
        document.getElementById(`${Element}.icon`).src = Object.Icon;
        document.getElementById(`${Element}.name`).innerHTML = Object.Name;
        document.getElementById(`${Element}.url`).innerHTML = Object.URL;
        if (Object.URL.includes('githubusercontent')) document.getElementById(`${Element}.url`).innerHTML = 'Internal Status Service'

        try {
            fetch(Object.URL).then(response => {
              if (!response.ok) return setOffline(Element);
              response.json().then((data) => {
                if (!data) setOffline(Element);
                if (data.maintence) setMaintence(Element);
                if (data && !data.maintence) setOnline(Element);
              }).catch(noJson => { setOffline(Element); })
            }).catch(error => { setOffline(Element); });
        } catch (err) { setOffline(Element); }
    }
};

getStatus();