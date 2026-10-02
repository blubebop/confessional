/** Pure demo game model. No wallet, entropy generation, or settlement calls. */
export const BOARD_SIZE = 16;
export const ROWS = 4;
export const COLUMNS = 4;
export const RISKS = [2, 4, 6, 8] as const;
export type Risk = (typeof RISKS)[number];
export type Phase = 'idle' | 'starting' | 'playing' | 'revealing' | 'won' | 'lost' | 'replaying';
export interface Selection {
  panelId: number;
  result: 'safe' | 'sin';
  payoutFactor: number;
  symbol: number;
}
export interface Round {
  gameId: string;
  randomWord: string;
  wager: number;
  mortalSinCount: Risk;
  sinPanelIds: number[];
  payoutFactors: number[];
  selections: Selection[];
  safeRevealCount: number;
  finalPayoutFactor: number;
  outcome: 'cashout' | 'sin' | 'complete' | null;
  completed: boolean;
}
export interface GameState {
  phase: Phase;
  currentView: 0 | 1 | 2;
  betAmount: number;
  mortalSinCount: Risk;
  round: Round | null;
  previousRound: Round | null;
  pendingPanel: number | null;
  error: string | null;
  replayIndex: number;
}
export function initialState(): GameState {
  return { phase: 'idle', currentView: 0, betAmount: 1, mortalSinCount: 4,
    round: null, previousRound: null, pendingPanel: null, error: null, replayIndex: 0 };
}
export function isRisk(value: number): value is Risk {
  return RISKS.some((risk) => risk === value);
}
export function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= k; i++) result = result * (n - i + 1) / i;
  return Math.round(result);
}
export function survivalProbability(sins: Risk, reveals: number): number {
  if (!isRisk(sins) || !Number.isInteger(reveals) || reveals < 0 || reveals > BOARD_SIZE - sins)
    throw new Error('Invalid reveal count or Mortal Sin preset.');
  return combinations(BOARD_SIZE - reveals, sins) / combinations(BOARD_SIZE, sins);
}
/** Fair demo only. A live integration must supply an approved payout table. */
export function fairDemoFactor(sins: Risk, reveals: number): number {
  survivalProbability(sins, reveals);
  return Number(BigInt(combinations(BOARD_SIZE, sins)) * BigInt(10_000)
    / BigInt(combinations(BOARD_SIZE - reveals, sins)));
}
/** Unrank a combination: exactly one board for each rank in [0, C(16,K)). */
export function boardFromRank(rank: number, sins: Risk): number[] {
  if (!isRisk(sins) || !Number.isInteger(rank) || rank < 0 || rank >= combinations(BOARD_SIZE, sins))
    throw new Error('Invalid board rank.');
  const board: number[] = [];
  let remaining = sins as number;
  for (let panel = 0; remaining > 0 && panel < BOARD_SIZE; panel++) {
    const count = combinations(BOARD_SIZE - panel - 1, remaining - 1);
    if (rank < count) { board.push(panel); remaining--; }
    else rank -= count;
  }
  return board;
}
/** Fixture mapping, NOT a platform-approved VRF conversion or production RNG. */
export function boardFromDemoWord(word: string, sins: Risk): number[] {
  if (!/^0x[0-9a-fA-F]{64}$/.test(word) || !isRisk(sins)) throw new Error('Invalid demo fixture.');
  return boardFromRank(Number(BigInt(word) % BigInt(combinations(BOARD_SIZE, sins))), sins);
}
export function createRound(gameId: string, word: string, wager: number, sins: Risk, payoutFactors: number[]): Round {
  if (!Number.isFinite(wager) || wager < 1 || wager > 25) throw new Error('Offering must be between 1 and 25 demo APE.');
  if (payoutFactors.length !== BOARD_SIZE - sins || payoutFactors.some((n) => !Number.isSafeInteger(n) || n <= 0))
    throw new Error('Missing or invalid payout table.');
  return { gameId, randomWord: word, wager, mortalSinCount: sins, sinPanelIds: boardFromDemoWord(word, sins),
    payoutFactors: [...payoutFactors], selections: [], safeRevealCount: 0, finalPayoutFactor: 0, outcome: null, completed: false };
}
export function revealPanel(round: Round, panelId: number): Round {
  if (round.completed || !Number.isInteger(panelId) || panelId < 0 || panelId >= BOARD_SIZE || round.selections.some((s) => s.panelId === panelId))
    throw new Error('This panel cannot be revealed.');
  const sin = round.sinPanelIds.includes(panelId);
  const safeRevealCount = round.safeRevealCount + (sin ? 0 : 1);
  const finalPayoutFactor = sin ? 0 : round.payoutFactors[safeRevealCount - 1];
  const outcome = sin ? 'sin' : safeRevealCount === BOARD_SIZE - round.mortalSinCount ? 'complete' : null;
  const selection: Selection = { panelId, result: sin ? 'sin' : 'safe', payoutFactor: finalPayoutFactor, symbol: panelId % 10 };
  return { ...round, safeRevealCount, finalPayoutFactor, outcome, completed: outcome !== null, selections: [...round.selections, selection] };
}
export function cashOut(round: Round): Round {
  if (round.completed || round.safeRevealCount === 0) throw new Error('Reveal a Confession before seeking absolution.');
  return { ...round, completed: true, outcome: 'cashout' };
}
export function replayFrame(saved: Round, count: number): Round {
  if (!saved.completed || !Number.isInteger(count) || count < 0 || count > saved.selections.length) throw new Error('Invalid replay frame.');
  const selections = saved.selections.slice(0, count);
  return { ...saved, selections, safeRevealCount: selections.filter((s) => s.result === 'safe').length,
    finalPayoutFactor: selections.at(-1)?.payoutFactor ?? 0, completed: false, outcome: null };
}
export function atmosphereStage(reveals: number, sins: Risk): number {
  const progress = reveals / (BOARD_SIZE - sins);
  return progress === 0 ? 0 : progress < .25 ? 1 : progress < .5 ? 2 : progress < .75 ? 3 : 4;
}
export function formatBlessing(factor: number): string {
  return `${(factor / 10_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
}
