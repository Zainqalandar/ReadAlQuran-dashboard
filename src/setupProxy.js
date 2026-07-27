const { createProxyMiddleware } = require('http-proxy-middleware');
const {
  authenticateCredentials,
  clearSessionCookie,
  createSessionToken,
  getDashboardApiToken,
  getSessionUser,
  readJsonBody,
  sendJson,
  sessionCookie,
} = require('../server/dashboardAuth');

const ALHUDA_ORIGIN = process.env.ALHUDA_API_ORIGIN || 'https://www.readalquran.online';

function getProxyPath(req) {
  return String(req.query.path || '').trim().replace(/^\/+|\/+$/g, '');
}

module.exports = function setupProxy(app) {
  app.post('/api/auth/signin', async (req, res) => {
    try {
      const user = authenticateCredentials(await readJsonBody(req));
      if (!user) {
        return sendJson(res, 401, { message: 'Invalid dashboard email or password.' });
      }

      const token = createSessionToken(user);
      return sendJson(res, 200, { ok: true, user }, { 'Set-Cookie': sessionCookie(req, token) });
    } catch (error) {
      return sendJson(res, 500, { message: error.message || 'Unable to sign in right now.' });
    }
  });

  app.get('/api/auth/session', (req, res) => {
    sendJson(res, 200, { user: getSessionUser(req) });
  });

  app.post('/api/auth/signout', (req, res) => {
    sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie(req) });
  });

  app.use(
    '/api/alhuda',
    (req, res, next) => {
      if (!getSessionUser(req)) {
        return sendJson(res, 401, { message: 'Dashboard session is required.' });
      }

      if (!getDashboardApiToken()) {
        return sendJson(res, 500, { message: 'ALHUDA_DASHBOARD_API_TOKEN is not configured.' });
      }

      if (!getProxyPath(req)) {
        return sendJson(res, 400, { message: 'A valid Al-Huda API path is required.' });
      }

      return next();
    },
    createProxyMiddleware({
      target: ALHUDA_ORIGIN,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        const proxyPath = getProxyPath(req)
          .split('/')
          .filter(Boolean)
          .map(encodeURIComponent)
          .join('/');
        return `/api/admin/${proxyPath}`;
      },
      onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader('X-ReadAlQuran-Dashboard-Token', getDashboardApiToken());
        proxyReq.path = proxyReq.path.replace(/[?&]path=[^&]*/g, '').replace('?&', '?');
      },
    })
  );
};
