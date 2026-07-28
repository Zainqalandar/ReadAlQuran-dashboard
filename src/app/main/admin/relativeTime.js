const RELATIVE_TIME_UNITS = [
  { label: 'year', seconds: 31536000 },
  { label: 'month', seconds: 2592000 },
  { label: 'day', seconds: 86400 },
  { label: 'h', seconds: 3600 },
  { label: 'm', seconds: 60 },
];

export function formatRelativeTime(value) {
  if (!value) return 'Never';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Unknown';

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (elapsedSeconds < 60) return 'just now';

  const unit = RELATIVE_TIME_UNITS.find((item) => elapsedSeconds >= item.seconds);
  const amount = Math.floor(elapsedSeconds / unit.seconds);

  if (unit.label === 'h' || unit.label === 'm') {
    return `${amount}${unit.label} ago`;
  }

  return `${amount} ${unit.label}${amount === 1 ? '' : 's'} ago`;
}

export function formatExactDateTime(value) {
  if (!value) return 'Never';

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
}
