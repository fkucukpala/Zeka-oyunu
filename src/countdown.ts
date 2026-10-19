import { useEffect, useState } from 'react';

function msUntilMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

/** Gece yarısına (günlük hakların yenilenmesine) kalan süre, "SS:DD:ss" biçiminde. */
export function useMidnightCountdown(): string {
  const [left, setLeft] = useState(msUntilMidnight);
  useEffect(() => {
    const id = setInterval(() => setLeft(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  return format(left);
}
