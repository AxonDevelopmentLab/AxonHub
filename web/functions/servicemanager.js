const services = {
  'instalock': {
    'windows_download': ''
  },
  'axsc': {
    'windows_download': '',
    'linux_download': '',
    'macos_download': '',
    'opensource': ''
  }
}

function getLink(Service, Name) {
  const allServices = Object.keys(services);
  if (!allServices.includes(Service)) return alert('Não foi possível entrar em contato com esse serviço, entre em contato com o suporte.');
  
  const subServices = Object.keys(services[Service]);
  if (!subServices.includes(Name)) return alert('Não foi possível entrar em contato com esse serviço, entre em contato com o suporte.');
  
  const getURL = services[Service][Name];
  
  const AxonHubURL = new URL(window.location.href).origin;
  window.open(`${AxonHubURL}/discord`, '_blank')
  window.location.href = getURL;
};