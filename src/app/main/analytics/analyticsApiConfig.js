const LIVE_ALHUDA_ORIGIN = 'https://readalquran.online';

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/+$/, '');
}

export const analyticsApiBase =
  normalizeOrigin(process.env.REACT_APP_ALHUDA_API_BASE) || LIVE_ALHUDA_ORIGIN;

export const alhudaAdminUrl = `${analyticsApiBase}/admin`;
