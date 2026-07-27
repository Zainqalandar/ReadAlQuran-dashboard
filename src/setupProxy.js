const {
  authenticateCredentials,
  clearSessionCookie,
  createSessionToken,
  getSessionUser,
  proxyAlhudaAdminRequest,
  readJsonBody,
  sendJson,
  sessionCookie,
} = require('../server/dashboardAuth');

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

  app.all('/api/alhuda', proxyAlhudaAdminRequest);
};
