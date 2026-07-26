const { createProxyMiddleware } = require('http-proxy-middleware');

const ALHUDA_ORIGIN = 'https://www.readalquran.online';

module.exports = function setupProxy(app) {
  app.use(
    '/alhuda',
    createProxyMiddleware({
      target: ALHUDA_ORIGIN,
      changeOrigin: true,
      pathRewrite: { '^/alhuda': '' },
    })
  );
};
