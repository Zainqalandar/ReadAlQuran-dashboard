const { proxyAlhudaAdminRequest, sendJson } = require('../server/dashboardAuth');

module.exports = async function alhudaProxy(req, res) {
  if (!['DELETE', 'GET', 'HEAD', 'POST'].includes(req.method)) {
    return sendJson(res, 405, { message: 'Method not allowed.' });
  }

  return proxyAlhudaAdminRequest(req, res);
};
