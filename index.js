const express = require('express');
const proxy = require('http-proxy-middleware');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const hostProxy = proxy({
  target: '**',
  xfwd: false,
  changeOrigin: true,
  router: (req) => {
    const hostname = req.headers['x-rsshub-hostname'];
    delete req.headers['x-rsshub-hostname'];
    return hostname;
  },
  onError: (err, req, res) => {
    console.error(`host rewrite ${req.originalUrl} error`);
  },
});
app.use('/*', (req, res, next) => {
  const hostname = req.headers['x-rsshub-hostname'];

  if (hostname && hostname !== '') {
    hostProxy(req, res, next);
  } else {
    next();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`));
