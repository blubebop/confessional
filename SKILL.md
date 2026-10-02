# Ape Church Game SDK — SKILL.md

This file contains instructions for AI agents building games using the Ape Church game template. Read this file in full before writing any code or modifying any files.

Also read [`docs/GAME-HUD.md`](./docs/GAME-HUD.md) before laying out your game. The Game HUD is the platform's standard desktop layout and every new game is built on it — § 4 below summarises it, that document is the full spec.

---

## 1. Files You May Edit

Only touch files in these locations:

```
components/my-game/          ← all game components go here
public/my-game/              ← all game assets go here
metadata.json                ← fill out before submitting
```

Rename `my-game` to your game's name in kebab-case throughout (e.g. `chicken-crossing`, `slot-machine`). This rename must be consistent across `components/`, `public/`, and `metadata.json`.

---

## 2. Files You Must Never Edit

Do not modify any of the following:

```
app/page.tsx
app/globals.css
app/layout.tsx
components/shared/           ← all files and subfolders (incl. GameHud.tsx, GameHudPage.tsx)
public/shared/               ← all files and subfolders
docs/                        ← platform reference docs
next.config.ts
tsconfig.json
package.json
package-lock.json
postcss.config.mjs
eslint.config.mjs
components.json
```

These are platform-managed files. Editing them will cause integration failures.

---

## 3. Required Component Files

Your `components/my-game/` folder must contain at minimum:

| File | Purpose |
|---|---|
| `MyGame.tsx` | Root game component. Owns all state, exposes all lifecycle functions, and renders the `GameHud` frame. |
| `MyGameWindow.tsx` | Your scene. Child of `GameWindow` from shared; its root must be `absolute inset-0`. |
| `MyGameSetupCard.tsx` | Bet configuration UI. Docks into the HUD panel — design it for a 300px column. |

Optional files you may add:
- `myGameConfig.ts` — configuration constants (multipliers, speeds, thresholds, layout mode, etc.)
- `my-game.styles.css` — game-scoped styles
- `MyGameInGameOverlay.tsx` — in-game control bar for full-size layout (see § Layout Options)
- Additional component files for complex game elements
- A `svg/` subfolder for SVG components

---

## 4. Layout — build on the Game HUD

**The Game HUD is the standard desktop layout for Ape Church games and what every new game must target.** Read [`docs/GAME-HUD.md`](./docs/GAME-HUD.md) in full before laying out your game — this section is the summary.

Set the mode in `myGameConfig.ts` (already the default):

```typescript
export type GameLayout = "hud" | "two-column" | "full-size";
export const myGameLayout: GameLayout = "hud";
```

### HUD (default — use this)

One bordered frame with a slim title bar, the setup card docked into a narrow left panel, and a wide game stage taking the rest of the width. The stage is **1139×765** on a 1920px monitor, versus 931×710 under the old two-column layout.

```
┌──────────────────────────────────────────────────────────┐
│ Game Title            [accessory]                        │  ← h-10 title bar
├───────────────┬──────────────────────────────────────────┤
│  Setup        │                                          │
│  Card         │           Game Stage                     │
│  300 / 340px  │   h = clamp(560px, 100vh-170px, 900px)   │
│  scrolls      │                                          │
└───────────────┴──────────────────────────────────────────┘
```

Wiring, in `MyGame.tsx`:

```tsx
import GameHud from "@/components/shared/GameHud";
import GameWindow from "@/components/shared/GameWindow";

<GameHud
  title={game.title}
  panel={<MyGameSetupCard {...setupCardProps} placement="hud" />}
  // Optional per-game stage constraint — a floor for content-heavy scenes, or
  // an aspect override for art-locked ones. See docs/GAME-HUD.md § 4.
  stageClassName="lg:min-h-[600px]"
>
  <GameWindow {...gameWindowShellProps} hudMode>
    <MyGameWindow {...gameProps} />
  </GameWindow>
</GameHud>
```

Then dock the setup card by putting `HUD_PANEL_CARD_CLASS` on its root:

```tsx
import { cn } from "@/lib/utils";
import { HUD_PANEL_CARD_CLASS } from "@/components/shared/GameHud";

<Card className={cn("p-6 flex flex-col", HUD_PANEL_CARD_CLASS)}>
```

**The five rules that matter:**

1. **No page-level `<h1>`.** `GameHud` owns the title.
2. **`hudMode` is required** on `GameWindow` / `WideGameWindow` — it drops the window's own border, rounding and aspect so it fills the stage.
3. **Design the setup card for a 300px column** (340px at `xl`), one `Card` root per view, styled with classes and never inline `style`.
4. **Use `lg:min-h-full`, never `lg:h-full`,** on the panel card — the panel column is `absolute inset-0 overflow-y-auto` and `h-full` silently clips.
5. **Everything below `lg` is unchanged.** Every HUD-related class is `lg:`-prefixed. Changing mobile is a bug.

### Sizing your scene for the stage

The stage is **not a fixed shape** — its height comes from the viewport and its width from the container, so it ranges from ~0.9:1 to ~1.9:1. Games that were authored against a square window read as small and lost inside it. Therefore:

- **The scene root is `absolute inset-0`.** No fixed width/height on the outermost scene element.
- **Size internals relatively** — `%`, container units (`cqw` / `cqh` / `cqmin`), `fr` grids, `aspect-*`.
- **Never use `vw` / `vh`.** That is the *viewport*, not the stage, and inside the HUD they diverge badly — a 1920px viewport carries a 1139px stage. `vw`-sized elements cap out well under what the stage can hold.
- **Never use a px value tuned against a square window.** If something must be px, either **cap** it (`w-[min(100cqmin,540px)]`) so it degrades instead of drifting, or **scale** it off the measured stage with a `ResizeObserver`.
- **Canvas / WebGL observes its container, not `window`** — `ResizeObserver` + `renderer.setSize` + `camera.aspect`, rAF-coalesced and zero-size guarded.
- **A perspective camera must fit by the constraining axis.** `fov` is vertical, so updating `camera.aspect` alone widens the frustum and reveals more background without making the subject any bigger.
- **Store interaction hit zones as fractions**, re-projected for aspect if the camera is perspective.
- **Background art:** author a 2560×1440 (16:9) master with everything important inside the centered 1200×1200 safe square; the flanks are croppable ambience. Full spec in `docs/GAME-HUD.md` § 6.

### Legacy modes

`"two-column"` (window left 2/3, card right 1/3) and `"full-size"` (full-width 4:3 window with controls overlaid inside the playfield, via `WideGameWindow` + `MyGameInGameOverlay.tsx`) still build, so existing games keep working. **Do not pick one for a new game** unless it genuinely cannot work in the HUD frame — and if so, say why in your submission.

---

## 5. Required Lifecycle Functions

`MyGame.tsx` must implement all of the following. These are the contract between your game and the platform. Do not rename them.

### `playGame()`
- Validates bet input
- Executes the on-chain transaction (use `console.log` as a mock during development)
- Retrieves the random result
- Initializes all game state needed for animations and logic
- Sets `currentView` to `1` (ongoing)

### `handleReset()`
- Clears ALL game state
- Resets ALL animations and timers
- Removes ALL references to the previous game
- Sets `currentView` to `0` (setup)
- After this call the game must look identical to first load — no exceptions

### `handlePlayAgain()`
- Calls `handleReset()`
- Then calls `playGame()` with new on-chain identifiers
- Used when user wants to place another bet immediately

### `handleRewatch()`
- Calls `handleReset()`
- Re-initializes using existing on-chain data (no new transaction)
- Prepares game to replay via `handleStateAdvance()` if applicable
- No currency is wagered, no transaction is sent

### `handleStateAdvance()` *(implement if applicable)*
- Advances the game through multi-step sequences
- Required for: slot machines with multiple spins, chained reveals, multi-phase animations
- Omit entirely if your game has a single continuous animation

---

## 6. Game State

Use `currentView` to track which view is active:

```typescript
const [currentView, setCurrentView] = useState<0 | 1 | 2>(0)
// 0 = setup view
// 1 = ongoing view
// 2 = game over view
```

Keep all game state consolidated in as few `useState` calls as possible. This makes `handleReset()` reliable. Scattered state is the most common source of reset bugs.

```typescript
// ✅ Correct
const [gameState, setGameState] = useState<GameState>(initialState)
const handleReset = () => setGameState(initialState)

// ❌ Wrong — easy to forget to reset individual values
const [score, setScore] = useState(0)
const [multiplier, setMultiplier] = useState(1)
const [isAnimating, setIsAnimating] = useState(false)
```

---

## 7. Shared Components

Import shared components using absolute paths. Do not copy them into your game folder.

```typescript
import GameHud, { HUD_PANEL_CARD_CLASS } from '@/components/shared/GameHud'
import GameWindow from '@/components/shared/GameWindow'
import WideGameWindow from '@/components/shared/WideGameWindow'
import GameResultsModal from '@/components/shared/GameResultsModal'
import BetAmountInput from '@/components/shared/BetAmountInput'
import CustomSlider from '@/components/shared/CustomSlider'
import ChipSelection from '@/components/shared/ChipSelection'
```

Never use relative paths to reference shared components:
```typescript
// ❌ Wrong
import GameWindow from '../shared/GameWindow'
import GameWindow from '../../components/shared/GameWindow'
```

---

## 8. Asset Rules

**Location** — all assets must live in `public/my-game/`. Do not place assets anywhere else.

**Required assets:**
- `card.png` — 1:1 aspect ratio, minimum 512x512px, used in the game gallery
- `banner.png` — 2:1 aspect ratio, minimum 1024x512px, used on the game detail page

**Format rules:**
- Images: WebP preferred, PNG accepted. No uncompressed formats.
- Audio: MP3 or OGG only. **WAV files are not allowed.**
- Total assets for a game must stay under 10MB.

**Referencing assets in code** — always use absolute paths from `public/`:
```tsx
// ✅ Correct
<img src="/my-game/background.png" />
<audio src="/my-game/audio/soundtrack.mp3" />

// ❌ Wrong
<img src="./assets/background.png" />
<img src="../public/my-game/background.png" />
```

---

## 9. TypeScript Rules

- All game state must have explicit TypeScript interfaces. Define these in `myGameConfig.ts` or at the top of `MyGame.tsx`.
- Do not use `any`. Use `unknown` and narrow the type, or define a proper interface.
- Game result data from on-chain should be typed explicitly, not inferred as `any`.
- All function signatures must have typed parameters and return types.

---

## 10. Three.js (3D graphics)

The template ships with **Three.js** (`three`) and **`@types/three`**. Game authors may use WebGL/3D in their components—typically in the window component—without adding dependencies.

**Imports:**
```typescript
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// Other addons live under three/addons/...
```

**React integration:**
- Mount the renderer to a container `ref` inside `useEffect` (client components only; use `"use client"` where needed).
- Store animation frame IDs, loaders, and disposable Three objects so cleanup can run when the effect tears down: cancel `requestAnimationFrame`, remove window listeners, dispose the renderer, remove `renderer.domElement` from the DOM, and stop/dispose mixers or controls as appropriate.
- Drive rendering from props/refs synced from game state so `handleReset()` can reset React state while the Three scene stays consistent (re-init scene state in effects or imperative refs when the round restarts, matching patterns used for timers and animation elsewhere).

**Assets:** GLBs and textures belong under `public/my-game/` with URLs like `/my-game/models/scene.glb`. Large 3D assets count toward the **10MB** per-game asset limit.

**Reference:** The submissions repo game **`jnkyz-skate-or-crash`** (`components/games/jnkyz-skate-or-crash/`, especially `MyGameWindow.tsx`) demonstrates GLTF loading, `AnimationMixer`, lighting, and cleanup on unmount. Paths there use `/submissions/jnkyz-skate-or-crash/...` because that repository’s layout differs from this template.

Do **not** edit `package.json` to add Three.js—it is already a dependency of this template.

---

## 11. Code Quality Rules

- Functions should be focused and under 50 lines where possible. Break complex logic into helper functions.
- No global side effects. All state lives inside the React component tree.
- Clean up `setTimeout`, `setInterval`, and animation frame references in `handleReset()`.
- Do not use inline styles for anything beyond dynamic values. Use CSS classes or the game's stylesheet.
- No `console.log` statements in final submission except inside `playGame()` as a mock transaction placeholder.

---

## 12. metadata.json

Fill out `metadata.json` at the repo root. This file is required for submission. All fields are required unless marked optional.

```json
{
  "team": "your-team-name",
  "gameName": "your-game-name",
  "displayTitle": "Your Game Title",
  "description": "A short description of your game. Three sentences max.",
  "authors": [
    {
      "name": "Your Name",
      "email": "your@email.com"
    }
  ],
  "status": "pending",
  "category": "arcade",
  "tags": ["arcade", "example"],
  "thumbnail": "/your-game-name/card.png",
  "banner": "/your-game-name/banner.png",
  "mainComponent": "YourGame.tsx",
  "windowComponent": "YourGameWindow.tsx",
  "setupComponent": "YourGameSetupCard.tsx",
  "configFile": "yourGameConfig.ts",
  "version": "1.0.0"
}
```

Rules:
- `team` and `gameName` must be kebab-case and match your folder names exactly
- `thumbnail` must be `/your-game-name/card.png`
- `banner` must be `/your-game-name/banner.png`
- `status` must be `"pending"` — do not change this value
- `category` must be one of: `arcade`, `card`, `puzzle`, `strategy`, `other`
- `configFile` is optional — only include if your game has a config file

---

## 13. Completion Checklist

Verify every item before considering the build complete. Do not submit until all are true.

**Functionality**
- [ ] `playGame()` initializes game and transitions to `currentView = 1`
- [ ] `handleReset()` returns game to exact first-load state with `currentView = 0`
- [ ] `handlePlayAgain()` successfully starts a new game after completion
- [ ] `handleRewatch()` replays the previous result without any new transaction
- [ ] `handleStateAdvance()` works correctly if the game uses multi-step progression
- [ ] Game renders correctly in default state (before any bet is placed)

**Layout (see `docs/GAME-HUD.md`)**
- [ ] `myGameLayout` is `"hud"` (or the submission explains why it can't be)
- [ ] No page-level `<h1>` — `GameHud` owns the title
- [ ] `hudMode` passed to `GameWindow` / `WideGameWindow`
- [ ] Setup card root carries `HUD_PANEL_CARD_CLASS`, uses `lg:min-h-full` (never `lg:h-full`), and every per-view root gets the treatment
- [ ] Scene root is `absolute inset-0`; no `vw`/`vh` sizing and no px values tuned to a square window
- [ ] Canvas / WebGL observes its container with a `ResizeObserver`, not `window`
- [ ] Verified from 1280px to 2560px wide and from a short laptop window to full height — no clipping or letterboxing
- [ ] Below `lg` is unchanged: every HUD-related class is `lg:`-prefixed

**Code quality**
- [ ] No edits to any file outside `components/my-game/`, `public/my-game/`, and `metadata.json`
- [ ] No TypeScript errors — run `npx tsc --noEmit` to confirm
- [ ] No console errors in browser
- [ ] All shared components imported via `@/components/shared/...`
- [ ] All asset paths use `/your-game-name/...` absolute format

**Assets**
- [ ] `card.png` present at 1:1 ratio
- [ ] `banner.png` present at 2:1 ratio
- [ ] No WAV files anywhere
- [ ] Total asset size under 10MB

**metadata.json**
- [ ] All required fields filled
- [ ] `gameName` matches folder name exactly
- [ ] `thumbnail` and `banner` paths are correct
- [ ] `status` is `"pending"`
