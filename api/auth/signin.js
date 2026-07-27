const {
  authenticateCredentials,
  createSessionToken,
  readJsonBody,
  sendJson,
  sessionCookie,
} = require('../../server/dashboardAuth');

module.exports = async function signin(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Method not allowed.' }, { Allow: 'POST' });
  }

  try {
    const body = await readJsonBody(req);
    const user = authenticateCredentials(body);

    if (!user) {
      return sendJson(res, 401, { message: 'Invalid dashboard email or password.' });
    }

    const token = createSessionToken(user);
    return sendJson(
      res,
      200,
      { ok: true, user },
      {
        'Set-Cookie': sessionCookie(req, token),
      }
    );
  } catch (error) {
    return sendJson(res, 500, {
      message: error.message || 'Unable to sign in right now.',
    });
  }
};
