import type { Game, PayoutStructure } from '@/lib/games';
import { BOARD_SIZE, RISKS, fairDemoFactor } from '@/components/my-game/engine';

export type GameLayout = 'hud' | 'two-column' | 'full-size';
export const myGameLayout: GameLayout = 'hud';
export const RISK_NAMES = { 2: 'PENANCE', 4: 'TEMPTATION', 6: 'JUDGMENT', 8: 'DAMNATION' } as const;
// Existing template semantics: getPayout(table, sins, safeReveals, 0) / 10_000.
// No independent house edge is invented. This table is a fair-odds demo fixture.
const payouts: PayoutStructure = Object.fromEntries(RISKS.map((sins) => [sins,
  Object.fromEntries(Array.from({ length: BOARD_SIZE - sins }, (_, i) => [i + 1, { 0: fairDemoFactor(sins, i + 1) }]))]));
export const myGame: Game = {
  title: 'CONFESSIONAL',
  description: 'Sixteen doors. One burden. Reveal your confessions and seek absolution before a Mortal Sin claims your offering.',
  gameAddress: '', gameBackground: '/my-game/card.png', card: '/my-game/card.png',
  banner: '/my-game/banner.png', themeColorBackground: '#b5965e', payouts,
};
// Public, predictable fixtures for the development mock. Never used for money.
export const DEMO_WORDS = [913, 7011, 83, 12051, 3649, 117, 2903, 8071]
  .map((rank) => `0x${rank.toString(16).padStart(64, '0')}`);
