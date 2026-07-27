const { getSessionUser, sendJson } = require('../../server/dashboardAuth');

module.exports = function session(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { message: 'Method not allowed.' }, { Allow: 'GET' });
  }

  return sendJson(res, 200, { user: getSessionUser(req) });
};
