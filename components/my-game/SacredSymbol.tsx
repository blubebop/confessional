import type { JSX } from 'react';

const symbols = [
  'M20 33h8V17h-8z M19 37h10 M24 14c-7-4 0-10 0-10s7 6 0 10Z',
  'M14 30h20l-4-6v-7a6 6 0 0 0-12 0v7z M21 34a3 3 0 0 0 6 0 M24 8v3',
  'M15 10h18v8a9 9 0 0 1-18 0z M24 27v10 M17 38h14 M12 12h3 M33 12h3',
  'M20 24a8 8 0 1 1 6-6 M20 24l-9 13 M13 34l4 3 M16 30l4 3',
  'M15 28h18l-4 9H19z M24 8v20 M17 14l-2 14 M31 14l2 14 M20 22c-6-5 5-7 0-12',
  'M24 8c-15 0-15 23 0 23s15-23 0-23Z M24 31v10 M20 37h8',
  'M16 15h16v22H16z M19 15V9h10v6 M21 23h6 M24 20v10 M13 38h22',
  'M13 11h22v28H13z M17 16h14 M17 21h10 M17 26h14 M17 31h8',
  'M16 17h16l3 20H13z M19 17v-4a5 5 0 0 1 10 0v4 M20 23h8v8h-8z',
  'M24 6l5 12 13 6-13 5-5 13-5-13-13-5 13-6Z M24 17v14 M17 24h14',
];
export default function SacredSymbol({ index = 9, sin = false }: { index?: number; sin?: boolean }): JSX.Element {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={sin ? 'M24 5 41 16v17L24 43 7 33V16z M27 8l-7 13 9 3-8 16 M13 17l7 4 M29 24l7 8' : symbols[index % symbols.length]} />
  </svg>;
}
