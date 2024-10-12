const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cmd = require('node-cmd');
const crypto = require('crypto');
const path = require('path')
const cors = require("cors");
const { exec } = require('child_process');

const app = express();
console.log('files updatet est')

app.use(bodyParser.json());
app.post('/git', (req, res) => {
  let hmac = crypto.createHmac("sha1", process.env.SECRET);
  let sig  = "sha1=" + hmac.update(JSON.stringify(req.body)).digest("hex");
  if (req.headers['x-github-event'] == "push" && sig == req.headers['x-hub-signature']) {
    cmd.run('chmod 777 ./git.sh'); 
    setTimeout(() => {
      exec('./git.sh', (err, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (err) console.error(stderr);
      });

      cmd.run('refresh');
    }, 10000)
  };
  
  return res.sendStatus(200);
});

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https://cdn.glitch.global"],
    connectSrc: ["'self'", "https://axon-cdn.glitch.me", "https://axon-api.glitch.me/", "https://raw.githubusercontent.com/AxonDevelopmentLab/AppsDetails/main/instalockapp.json", "https://axon-sync.glitch.me/", "https://axsc.glitch.me"],
    scriptSrcAttr: ["'self'", "'unsafe-inline'"]
  }
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(compression(), cors());
app.use(express.static(path.join(__dirname, 'web')));

const routes = [
  { url: '/robots.txt', type: 'file', content: 'robots.txt' },
  { url: '/discord', type: 'file', content: 'discord_redirect.html' },
  { url: '/open-source', type: 'file', content: 'open_source.html' },
  { url: '/privacy-politics', type: 'file', content: 'privacy-politics.html' },
  { url: '/terms-of-use', type: 'file', content: 'terms-of-use.html' },
  { url: '/services', type: 'file', content: 'services.html' },
  { url: '/services/instalock', type: 'file', content: 'services_instalock.html' },
  { url: '/services/axsc', type: 'file', content: 'services_axsc.html' },
  { url: '/store/checkout', type: 'file', content: 'checkout.html' },
  { url: '/store', type: 'file', content: 'store.html' },
  { url: '/status', type: 'file', content: 'status.html' },
  { url: '/support', type: 'file', content: 'suporte.html' },
  { url: '/account', type: 'file', content: 'account_login.html' },
  { url: '/account/dashboard', type: 'file', content: 'account_dashboard.html' },
  { url: '/account/verify', type: "function", content: (req, res) => {
    if (req.query.token && req.query.id) return res.send(`<body onload="location.href='https://axon-api.glitch.me/email_verification?id=${req.query.id}&token=${req.query.token}'"></body>`);
    return res.send(`<body onload="window.close()"></body>`);
  }}
];

routes.forEach(route => {
    app.get(route.url, (req, res) => {
      if (req.url.endsWith('/')) return res.send(`<body onload="location.href='${req.protocol + '://' + req.get('host') + req.url.substring(0, req.url.length - 1)}'"></body>`)
      if (route.type === "file") res.sendFile(path.join(__dirname, 'web', route.content));
      if (route.type === "send") res.send(route.content);
      if (route.type === "function") route.content(req, res);
    });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'unknown_page.html'));
});

const server = app.listen(8080, () => { console.log('[AxonHub] Service is running.')});
