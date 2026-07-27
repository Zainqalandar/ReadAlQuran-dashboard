const {
  getDashboardApiToken,
  getSessionUser,
  readJsonBody,
  sendJson,
} = require('../../server/dashboardAuth');

const DEFAULT_ALHUDA_ORIGIN = 'https://www.readalquran.online';

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/+$/, '');
}

function buildTargetUrl(req) {
  const origin = normalizeOrigin(process.env.ALHUDA_API_ORIGIN) || DEFAULT_ALHUDA_ORIGIN;
  const path = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean);
  const url = new URL(`/api/admin/${path.map(encodeURIComponent).join('/')}`, origin);

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === 'path') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
      return;
    }

    if (value !== undefined) {
      url.searchParams.set(key, value);
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

    const upstream = await fetch(buildTargetUrl(req), {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
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
