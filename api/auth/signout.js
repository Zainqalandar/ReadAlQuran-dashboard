const { clearSessionCookie, sendJson } = require('../../server/dashboardAuth');

module.exports = function signout(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return sendJson(res, 405, { message: 'Method not allowed.' }, { Allow: 'GET, POST' });
  }

  return sendJson(
    res,
    200,
    { ok: true },
    {
      'Set-Cookie': clearSessionCookie(req),
    }
  );
};
