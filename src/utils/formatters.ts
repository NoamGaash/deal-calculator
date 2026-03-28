const ILS = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
});

const ILS_PRECISE = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function fmtILS(value: number): string {
  return ILS.format(value);
}

export function fmtILSShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}₪${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000)     return `${sign}₪${(abs / 1_000).toFixed(0)}K`;
  return ILS_PRECISE.format(value);
}

export function fmtPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function fmtNum(value: number, decimals = 0): string {
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function fmtMonths(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${y} שנים`;
  return `${y} שנים ו-${m} חודשים`;
}

export function fmtX(value: number): string {
  return `${value.toFixed(2)}x`;
}
