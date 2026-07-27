const {
  getDashboardApiToken,
  getSessionUser,
  readJsonBody,
  sendJson,
} = require('../server/dashboardAuth');

const DEFAULT_ALHUDA_ORIGIN = 'https://www.readalquran.online';

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/+$/, '');
}

function normalizeProxyPath(value) {
  const path = String(value || '').trim().replace(/^\/+|\/+$/g, '');

  if (!path || path.includes('..')) {
    return '';
  }

  return path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

function buildTargetUrl(req) {
  const origin = normalizeOrigin(process.env.ALHUDA_API_ORIGIN) || DEFAULT_ALHUDA_ORIGIN;
  const requestUrl = new URL(req.url, `https://${req.headers.host || 'dashboard.local'}`);
  const path = normalizeProxyPath(requestUrl.searchParams.get('path'));

  if (!path) {
    return null;
  }

  const url = new URL(`/api/admin/${path}`, origin);
  requestUrl.searchParams.forEach((value, key) => {
    if (key !== 'path') {
      url.searchParams.append(key, value);
    }
  });

  return url;
}

module.exports = async function alhudaProxy(req, res) {
  if (!getSessionUser(req)) {
    return sendJson(res, 401, { message: 'Dashboard session is required.' });
  }

  const token = getDashboardApiToken();
  if (!token) {
    return sendJson(res, 500, { message: 'ALHUDA_DASHBOARD_API_TOKEN is not configured.' });
  }

  const targetUrl = buildTargetUrl(req);
  if (!targetUrl) {
    return sendJson(res, 400, { message: 'A valid Al-Huda API path is required.' });
  }

  try {
    const headers = {
      Accept: req.headers.accept || 'application/json',
      'X-ReadAlQuran-Dashboard-Token': token,
    };

    let body;
    if (!['GET', 'HEAD'].includes(req.method)) {
      const parsedBody = await readJsonBody(req);
      body = JSON.stringify(parsedBody);
      headers['Content-Type'] = 'application/json';
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });
    const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
    const responseBody = Buffer.from(await upstream.arrayBuffer());

    res.statusCode = upstream.status;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    res.end(responseBody);
  } catch {
    sendJson(res, 502, { message: 'Unable to reach Al-Huda API right now.' });
  }
};
