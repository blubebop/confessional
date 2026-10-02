# Confessional — integration status

## Development demo

The game implementation lives directly in `components/my-game/`, and its assets
live in `public/my-game/`. Only those two folders and `metadata.json` may differ
from the official template. There are no forwarding entry files or separate
Confessional folders. Imports and asset URLs use the permitted `my-game` paths.
The explicit user requirement to retain those folder names takes precedence over
the template's general folder-renaming advice. The metadata game identifier is
`my-game` to match those folders; the display title remains CONFESSIONAL.
Its thumbnail and banner point to `/my-game/`.

The boundary audit corrected the earlier placement under `components/confessional/`
and `public/confessional/`. Those directories were removed after moving their
contents into the permitted folders. Platform files and package configuration
remain unchanged. `boundary-audit.cjs` checks protected files byte-for-byte against
the downloaded template and detects unexpected source files outside the boundary.

The scene uses the standard GameHud and GameWindow, the shared BetAmountInput,
and the exact template `playGame(gameId?: bigint, randomWord?: Hex)` signature.
Lifecycle functions include reset, play again, rewatch, and state advance.
`currentView` is 0 / 1 / 2; loading is the starting phase; replay is explicit.
GameWindow receives payout as wager × payoutFactor / 10,000. Its generic result
modal is not invoked; the game supplies the themed result UI.

## Missing production contract

The downloaded template contains mock receipts and example client-side outcomes,
not a chain request/reveal/settlement implementation. Its Game type has no house
edge, wallet limits, or pool-liquidity fields. The supplied docs specify no Mines
VRF mapping or progressive settlement interface. No invented live API is used.

This build is visibly marked DEMO. Fixed public fixture words map to combination
ranks modulo C(16,K); lexicographic unranking gives exactly K distinct sins among
16 IDs. That is a deterministic TEST mapping, not an approved randomness mapping.
Modulo mapping is not claimed to be perfectly unbiased for arbitrary 256-bit
words. Template randomBytes generates mock request identifiers only.

Real-money release requires Ape Church to provide:

- Authoritative start, reveal, cashout, receipt, and recovery interfaces.
- Approved randomness/board mapping and server/contract validation of choices.
  A browser that holds the full hidden board cannot be trusted to settle money.
- Approved payout table including house edge, settlement rounding and precision,
  maximum payout, wallet balance, wager bounds, and pool limits.
- Persisted on-chain round lookup if URL-based historical replay is required.

Do not connect the current demo board to a real balance. Its local outcomes and
cashout are presentation only. A live adapter must also handle receipt ambiguity
and resume pending settlements without duplicate transactions.

## Math

Survival probability is C(16-r,K) / C(16,K). The fair demo factor is
floor(10,000 × C(16,K) / C(16-r,K)), computed with integer BigInt division.
The existing `Game.payouts[K][r][0]` table and `getPayout()` supply those factors.
The round snapshots the table at start. No further edge is applied. Display
rounding is independent of the saved integer factor. Demo limits match the
template's minimum 1 and mocked balance 25 APE; no wallet balance is changed.

## Replay and reset

Each completed immutable round contains the fixture, ID, Offering, risk, board,
table, ordered selections, cosmetic symbol IDs, per-reveal factor, and result.
Rewatch captures it, calls handleReset, then replays saved selections without
playGame or any new randomness. Completion restores the original result.
Reset clears current and previous rounds, errors, locks, pending panels and
timers, restores default Offering 1 / risk 4, and remounts the scene to reset CSS
animation phases. An epoch invalidates stale callbacks. All action guards read a
synchronous state mirror, so double clicks cannot race a React render.

## Assets and metadata

Artwork is original vector geometry rasterized to PNG with the existing Sharp
dependency. No external imagery, faces, audio, or new dependencies are used.
Audio is intentionally silent in V1. Card: 512×512. Banner: 1024×512.
Team: APEGROUNDZ. Revenue share: 100% to the user-provided checksummed address in
metadata. The creator and revenue-share Telegram handle is `blubebop`.

## Local checks

`node components/my-game/engine.test.cjs`

`npx tsc --noEmit`

`npm run dev`

Tests enumerate all 22,818 possible boards across the four risk presets, check
uniform panel occupancy over those ranks, all reveal probabilities and integer
payout factors, immutable replay, loss/cashout/completion, and invalid inputs.

## Verified in this build

- TypeScript no-emit check and scoped ESLint passed.
- Next.js production build passed with network access for the unchanged
  template's Google fonts. A network-restricted build cannot fetch those fonts.
- Browser: initial 16 closed panels; Offering and all four risk controls;
  loading/disabled controls; keyboard start/reveal; rapid double start/reveal/
  cashout; one-safe-panel cashout at 1.33x; loss at 0x; win and loss replay;
  replay cancellation; Play Again; and reset to Offering 1 / risk 4.
- Full completion: 14 safe reveals at risk 2 automatically yielded 120.00x.
- Browser log counts stayed unchanged through win/loss replay. Play Again
  produced one fresh mock transaction and 16 closed panels.
- Layout checked at 320×740, 390×844, 1280×720, 1920×1080, 2560×1440;
  no horizontal document overflow. Desktop panel scrolls and pins its action.
- No browser warning/error logs during the interaction checks.
- Platform-managed source files matched the downloaded template byte-for-byte.
- Original card/banner art totals 119,970 bytes. Including the untouched starter
  assets, the entire game asset folder totals 2,239,270 bytes, below the 10MB limit.

Not verified or available: real transactions, on-chain randomness, approved
house edge, pool-limited payouts, persistent history, or audio. These are not
represented as working production functionality in the demo.

## Visual revision: candlesticks and descent

At the user's explicit request, the original no-eyes direction is superseded:
two glowing eyes now sit behind the lattice and track the cursor. There is still
no surrounding facial artwork. Tracking uses a cleaned-up, animation-frame
coalesced pointer listener and only updates cosmetic CSS variables. It is centered
for touch, replay, results, and reduced-motion preferences.

Original SVG brass candlesticks now extend from each candle to the wooden ledge.
Revealed safe panels retain a pulsing gold border. Safe-reveal progress drives
inward wall shadows, breathing haze, dust intensity, silhouette pace, and eye
brightness. Each safe reveal adds a short ambient pulse. None of these effects
reads hidden sin locations or changes the board, payout, or action timing.
Reduced-motion mode disables animation and gaze movement. Reset remounts the
scene and clears its listeners/animation frame along with the existing effects.
