// Production analytics must use the canonical Al-Huda origin.
const LIVE_ALHUDA_ORIGIN = 'https://www.readalquran.online';

function normalizeOrigin(origin) {
  const normalizedOrigin = String(origin || '').trim().replace(/\/+$/, '');

  if (normalizedOrigin === 'https://readalquran.online') {
    return LIVE_ALHUDA_ORIGIN;
  }

  return normalizedOrigin;
}

export const analyticsApiBase =
  normalizeOrigin(process.env.REACT_APP_ALHUDA_API_BASE) ||
  (process.env.NODE_ENV === 'development' ? '/alhuda' : LIVE_ALHUDA_ORIGIN);
