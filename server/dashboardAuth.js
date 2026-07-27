const crypto = require('crypto');

const COOKIE_NAME = 'readalquran_dashboard_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashValue(value) {
  return crypto.createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function safeCompare(left, right) {
  const leftValue = String(left || '');
  const rightValue = String(right || '');
  const leftBuffer = Buffer.from(leftValue);
  const rightBuffer = Buffer.from(rightValue);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getSessionSecret() {
  return process.env.DASHBOARD_SESSION_SECRET || '';
}

function getAdminEmail() {
  return normalizeEmail(process.env.DASHBOARD_ADMIN_EMAIL || process.env.ADMIN_EMAIL);
}

function getAdminPasswordHash() {
  const configuredHash = String(process.env.DASHBOARD_ADMIN_PASSWORD_SHA256 || '').trim();
  if (configuredHash) {
    return configuredHash.toLowerCase();
  }

  const configuredPassword = process.env.DASHBOARD_ADMIN_PASSWORD;
  return configuredPassword ? hashValue(configuredPassword) : '';
}

function getDashboardApiToken() {
  return process.env.ALHUDA_DASHBOARD_API_TOKEN || process.env.DASHBOARD_API_TOKEN || '';
}

function sign(payload) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function createSessionToken(user) {
  if (!getSessionSecret()) {
    throw new Error('DASHBOARD_SESSION_SECRET is not configured.');
  }

  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    })
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

function parseCookies(cookieHeader) {
  return String(cookieHeader || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf('=');
      if (index === -1) {
        return cookies;
      }

      cookies[part.slice(0, index)] = decodeURIComponent(part.slice(index + 1));
      return cookies;
    }, {});
}

function verifySessionToken(token) {
  if (!token || !getSessionSecret()) {
    return null;
  }

  const [payload, signature] = String(token).split('.');
  if (!payload || !signature || !safeCompare(signature, sign(payload))) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session.role === 'admin' ? session : null;
  } catch {
    return null;
  }
}

function getSessionUser(req) {
  const cookies = parseCookies(req.headers.cookie);
  const session = verifySessionToken(cookies[COOKIE_NAME]);

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    email: session.email,
    name: session.name,
    role: 'admin',
    photo: '',
  };
}

function cookieOptions(req, maxAge = SESSION_TTL_SECONDS) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const isHttps = forwardedProto === 'https' || process.env.VERCEL === '1';

  return [
    `${COOKIE_NAME}=`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    isHttps ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

function sessionCookie(req, token) {
  return `${cookieOptions(req).replace(`${COOKIE_NAME}=`, `${COOKIE_NAME}=${encodeURIComponent(token)}`)}`;
}

function clearSessionCookie(req) {
  return cookieOptions(req, 0);
}

function authenticateCredentials({ email, password }) {
  const adminEmail = getAdminEmail();
  const passwordHash = getAdminPasswordHash();

  if (!adminEmail || !passwordHash) {
    throw new Error('Dashboard credentials are not configured.');
  }

  const emailMatches = normalizeEmail(email) === adminEmail;
  const passwordMatches = safeCompare(hashValue(password), passwordHash);

  if (!emailMatches || !passwordMatches) {
    return null;
  }

  return {
    id: 'dashboard-admin',
    name: 'Read Al Quran Admin',
    email: adminEmail,
    role: 'admin',
    photo: '',
  };
}

function sendJson(res, status, payload, headers = {}) {
  res.statusCode = status;
  Object.entries({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  }).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }

  if (typeof req.body === 'string') {
    return Promise.resolve(JSON.parse(req.body || '{}'));
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

module.exports = {
  authenticateCredentials,
  clearSessionCookie,
  createSessionToken,
  getDashboardApiToken,
  getSessionUser,
  readJsonBody,
  sendJson,
  sessionCookie,
};
