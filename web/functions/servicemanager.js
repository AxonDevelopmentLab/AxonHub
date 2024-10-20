const services = {
  'instalock': {
    'windows_download': 'https://www.dropbox.com/scl/fi/cwa8x0xy5chrnqsdu8qbp/InstalockAPP-Installer.exe?rlkey=opw01zki6sxf1187y4qmz7pp5&st=srycbk1q&dl=1'
  },
  'axsc': {
    'windows_download': 'https://github.com/akkui/AXSC-Client/releases/download/v1.0.1/axsc-win.exe',
    'linux_download': 'https://github.com/akkui/AXSC-Client/releases/download/v1.0.1/axsc-linux',
    'macos_download': 'https://github.com/akkui/AXSC-Client/releases/download/v1.0.1/axsc-macos',
    'opensource': 'https://github.com/akkui/AXSC-Client'
  }
}

function getLink(Service, Name) {
  const allServices = Object.keys(services);
  if (!allServices.includes(Service)) return alert('Não foi possível entrar em contato com esse serviço, entre em contato com o suporte.');
  
  const subServices = Object.keys(services[Service]);
  if (!subServices.includes(Name)) return alert('Não foi possível entrar em contato com esse serviço, entre em contato com o suporte.');
  
  const getURL = services[Service][Name];
  
  const AxonHubURL = new URL(window.location.href).origin;
  if (Name !== 'opensource') window.open(`${AxonHubURL}/discord`, '_blank')
  window.location.href = getURL;
};