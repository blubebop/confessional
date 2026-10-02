# Game HUD — the standard game layout

This is the canonical reference for the **desktop game HUD**: the unified frame
that replaced the old "title, then a square window, then a card beside it"
layout. **New games should be built on it from day one.**

The HUD is a **layout** concern only. It does not touch your game logic, RNG,
audio, or the lifecycle functions in `SKILL.md` — build the game, then make sure
it sits in this frame correctly. A game built to the rules in §5 drops into the
HUD with no work at all.

---

## 1. What it looks like

```
┌──────────────────────────────────────────────────────────┐  ← lg:border-[3px] #2A3640
│ Game Title            [accessory]                        │  ← h-10 title bar
├───────────────┬──────────────────────────────────────────┤
│               │                                          │
│  panel        │  stage                                   │
│  300 / 340px  │  flex-1, h = clamp(560px, 100vh-170px, 900px)
│  scrolls      │  (children: GameWindow hudMode)          │
│  internally   │                                          │
└───────────────┴──────────────────────────────────────────┘
```

The bet/setup card is docked into a narrow left panel and the game gets the
rest of the width. On a 1920px monitor that is a **1139×765** stage, versus
931×710 under the old layout.

### The pieces

| Piece | File | Job |
|---|---|---|
| `GameHud` | `components/shared/GameHud.tsx` | The frame. Title bar, panel column, stage. |
| `GameHudPage` | `components/shared/GameHudPage.tsx` | The page shell. Width cap + reclaims the page's padding. |
| `hudMode` | `GameWindow.tsx` / `WideGameWindow.tsx` | Tells the window "the frame is not yours" — drop the border/rounding/aspect and fill the stage. |
| `HUD_PANEL_CARD_CLASS` | `components/shared/GameHud.tsx` | The docking treatment your setup card applies to itself. |
| `--game-hud-stage-*` | `app/globals.css` | The three stage-height figures, tuned in one place. |

All of these are platform-managed — **do not edit them**. You compose with them
from inside `components/my-game/`.

### Key properties

- **Stage height is viewport-driven, not aspect-driven.** Procedural scenes
  (canvas, DOM, WebGL) have no art aspect to honour, and a hard 16:9 came out
  shorter than the old square window on laptops. Art-locked games override this
  via `stageClassName` (see §4).
- **The panel is `300px`, widening to `340px` at `xl`.** At 1024–1280 the frame
  is only ~830px wide and a fixed 340 ate 41% of it. **Design your setup card
  for a 300px column.**
- **The panel column is height-pinned to the stage.** Its inner wrapper is
  `lg:absolute lg:inset-0 lg:overflow-y-auto`, so a tall setup card scrolls
  instead of stretching the frame. This is why panel cards need `lg:min-h-full`,
  **never** `lg:h-full`.
- **The stage is `relative`.** Everything your game draws is expected to be
  `absolute inset-0` inside it.

### Mobile contract (`< lg`) — do not touch

**Every HUD style is `lg:`-prefixed.** Below `lg` the markup renders exactly the
classic layout: title row, game window, controls stacked underneath, no outer
frame. The square mobile presentation is deliberate. Anything you add for the
HUD must be `lg:`-prefixed too, or you have changed mobile — which is a bug.

---

## 2. Building a game on the HUD

### The page

`app/page.tsx` (platform-managed) already does this — it is here so you know
what your game is rendered into:

```tsx
import GameHudPage from "@/components/shared/GameHudPage";

const MyGamePage: React.FC = () => (
  <GameHudPage>
    {/* No page-level <h1> — GameHud owns the title. */}
    <MyGameComponent game={myGame} />
  </GameHudPage>
);
```

### Your game component

Set `myGameLayout = "hud"` in `myGameConfig.ts` (the default), then:

```tsx
import GameHud from "@/components/shared/GameHud";
import GameWindow from "@/components/shared/GameWindow";

return (
  <div>
    <GameHud
      title={game.title}
      // Optional: a floor or aspect override for the stage — see §4.
      stageClassName="lg:min-h-[600px]"
      panel={<MyGameSetupCard {...setupCardProps} placement="hud" />}
    >
      <GameWindow {...gameWindowShellProps} hudMode>
        <MyGameWindow {...gameProps} />
      </GameWindow>
    </GameHud>

    {/* History / rules sections stay OUTSIDE the frame. */}
    <div className="mt-12 lg:mt-16">…</div>
  </div>
);
```

Notes:

- `GameHud` **is** the two-column wrapper. There is no
  `flex flex-col lg:flex-row gap-8` around it.
- The setup card moves into the `panel` prop. Its props do not change.
- `hudMode` on the window is required. It adds
  `lg:basis-auto lg:h-full lg:aspect-auto lg:border-0 lg:rounded-none`.
- The platform injects a leaderboard trigger into `accessory` when your game
  goes live. Leave it unset.

### Your setup card

Apply the docking treatment to the card's root:

```tsx
import { cn } from "@/lib/utils";
import { HUD_PANEL_CARD_CLASS } from "@/components/shared/GameHud";

<Card className={cn("p-6 flex flex-col", HUD_PANEL_CARD_CLASS)}>
```

The constant is
`lg:min-h-full lg:basis-auto lg:p-4 lg:border-0 lg:rounded-none lg:bg-transparent lg:shadow-none`.
Compose per-card extras **after** it so `twMerge` resolves in your favour:

```tsx
// Gradient surface: bg-transparent only kills the colour, not the image.
cn(MY_SURFACE, HUD_PANEL_CARD_CLASS, "lg:bg-none")
// Tighter rhythm when docked.
cn("… gap-5", HUD_PANEL_CARD_CLASS, "lg:gap-3")
```

**If your card renders a different root per view** (setup / live / result),
every root gets the treatment — otherwise the panel visibly re-grows a border
mid-game.

---

## 3. Verify

- `npx tsc --noEmit` — no errors.
- Resize from 1280px to 2560px wide, and from a short laptop window to full
  height. The scene must not clip, letterbox oddly, or leave the panel floating.
- Check `< lg` is pixel-identical to before your HUD changes.
- Check the panel column scrolls (not clips) when the setup card is tall.

---

## 4. Gotchas

Each of these cost real debugging time on the games already migrated.

**Panel card uses `lg:h-full` and its bottom half vanishes.**
The panel column is `absolute inset-0 overflow-y-auto`. `h-full` pins the card
to the column height and the overflow is silently clipped; `lg:min-h-full` lets
it grow and the column scroll. Always `min-h`.

**An inline `style` anywhere in the fill chain beats every `lg:` utility.**
This bites on both sides of the frame:
- *Card side:* a branded surface written as `style={{ background: …, border: … }}`
  must become classes (`bg-[linear-gradient(…)]`, `border-[rgba(…)]`,
  `shadow-[…]`) before the docking overrides can win. Remember `lg:bg-none` for
  gradients.
- *Scene side:* an inline `aspectRatio` on a canvas host blocks `lg:aspect-auto`
  the same way. Use `aspect-[16/9] lg:aspect-auto` classes instead.

This is why `SKILL.md` says not to use inline styles for anything beyond
dynamic values.

**Scene has rounded corners inside the frame.**
The HUD owns the frame. Any scene root that draws its own `rounded-*` /
`border` needs `lg:rounded-none lg:border-0` — otherwise you get a rounded
rectangle floating inside a rounded rectangle.

**The scene fills the stage but the game still looks small.**
The most common complaint, with two distinct causes — diagnose which before
touching anything:

- *Fixed px tuned to the old ~827px square window.* A hardcoded 90px cube and a
  `max-w-[326px]` table leave the grid at 35% of a 1139px stage. Fix: derive the
  size from the **measured stage**, not a viewport breakpoint. Observe the
  container, subtract the measured heights of the rows above and below, and
  scale off what's left — clamped (e.g. 1–2.2× the authored size) so it can
  never shrink below the original or run away.
- *A `vw`-based size.* `vw` is the **viewport**, not the stage. Inside the HUD
  they diverge badly — a 1920px viewport carries a 1139px stage, narrower still
  with a sidebar out. `clamp(44px, 12vw, 90px)`-style sizing caps out well under
  what the stage can hold. Container units (`cqmin` / `cqh`) or a measured
  observer are the correct signals; `vw` never is.

**A perspective camera makes the stage wider, never the subject bigger.**
`PerspectiveCamera(fov, aspect, …)` — `fov` is **vertical**. Updating
`camera.aspect` on resize (which you must do) widens the horizontal frustum and
changes nothing else: the subject keeps exactly the same on-screen height and
you get empty flanks. If a 3D game reads as "small in a wide window",
`setSize` is not the problem — the camera needs to **fit by the constraining
axis**: compute the distance (or fov) that contains the subject's bounding box
for the live aspect, so a wide stage dollies in rather than just revealing more
background.

**three.js canvas doesn't follow the stage.**
`window.resize` is the wrong signal — the stage changes size without the window
doing anything (breakpoint flip, scrollbar, sidebar collapse). Observe the
**container**:

```ts
const applyResize = () => {
  const w = container.clientWidth, h = container.clientHeight;
  if (w === 0 || h === 0) return;              // display:none during a layout swap
  if (w === lastWidth && h === lastHeight) return;
  renderer.setSize(w, h);
  composer.setSize(w, h);                       // forwards to every pass' render target
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
};
// rAF-coalesced: never reallocate render targets inside the observer callback
// ("ResizeObserver loop completed with undelivered notifications").
const handleResize = () => { if (frame === null) frame = requestAnimationFrame(applyResize); };
new ResizeObserver(handleResize).observe(container);
```

A `ResizeObserver` also fires once on `observe`, which covers the first layout
pass — you do not need a separate mount-time measure.

**Fixed-px animation tuned to a square window drifts in a wide one.**
Two valid fixes:
- *Cap the element.* Size the play area off the *smaller* stage axis and cap it:
  `w-[min(100cqmin,540px)] aspect-square`, with the window set to
  `lg:[container-type:size]`.
- *Re-project the coordinates.* Store hit zones as fractions and re-project them
  for the live aspect, using the calibration aspect as `1` so mobile stays
  bit-for-bit unchanged.

**Content is taller than the stage on a short laptop.**
Add a floor via `stageClassName`: `lg:min-h-[600px]`.

**The art (or canvas design space) is authored at a fixed aspect.**
Override the height entirely rather than fighting it:

```tsx
stageClassName="lg:h-auto lg:aspect-[4/3] lg:max-h-[860px]"
```

`lg:h-auto` releases the viewport height so the aspect class governs. The
override only pays off if the descendants actually fill it: every intermediate
wrapper needs `lg:h-full` down to the scene box, and a scene box with its own
intrinsic `aspect-*` needs `lg:aspect-auto`.

**Board content that genuinely can't be fluid.**
Cap it instead of stretching it. But check the constraint is real first — a
board that *looks* like fixed art is often a handful of flat vector shapes that
can be redrawn in CSS and made fully fluid with container-unit column math.

**Mobile gaps changed.**
`GameHud`'s column gap is `gap-4 sm:gap-8`. If your game shipped with a
different mobile gap, cancel the delta on the stage
(`sm:-mb-4 md:-mb-8 lg:mb-0`) rather than fighting the HUD.

**A panel that renders nothing in a breakpoint band.**
If an in-playfield control bar owns the controls between `md` and `lg`, wrap the
card in `<div className="md:hidden lg:block lg:h-full">`. The `lg:h-full`
matters: it gives the card a definite parent height so its own `lg:min-h-full`
and `grow` spacers resolve.

---

## 5. New-game checklist

Build to these and the HUD needs no porting work at all.

- [ ] **The scene root is `absolute inset-0`** inside the window. No fixed
      width/height on the outermost scene element.
- [ ] **Internals are sized relatively** — `%`, container units
      (`cqw` / `cqh` / `cqmin`), `fr` grids, `aspect-*`. Never `vw`/`vh` (that's
      the viewport, not the stage — they diverge badly inside the HUD) and never
      a px value tuned against a square window. If something genuinely must be
      px, either **cap** it (`w-[min(100cqmin,540px)]`) so it degrades instead of
      drifting, or **scale** it off the measured stage.
- [ ] **A perspective camera fits by the constraining axis**, not by vertical
      fov alone — otherwise a wide stage only reveals more background.
- [ ] **Any canvas / WebGL context observes its container**, not `window` —
      `ResizeObserver` + `renderer.setSize` + `camera.aspect`, rAF-coalesced,
      zero-size guarded.
- [ ] **Interaction hit zones are stored as fractions**, and re-projected for
      aspect if the camera is perspective.
- [ ] **The setup card is one `Card` root per view**, styled with classes (never
      inline `style`), carrying `HUD_PANEL_CARD_CLASS`. **Assume a 300px column.**
- [ ] **No page-level `<h1>`** — `GameHud` owns the title.
- [ ] **`hudMode` is passed to the window component.**
- [ ] **Nothing below `lg` depends on HUD styles.** Every HUD-related class you
      add is `lg:`-prefixed.

---

## 6. Background art spec (for designers)

The HUD stage is **not a fixed shape**: height is viewport-driven
(`clamp(560px, 100vh-170px, 900px)`) while width comes from the container, so
the visible window ranges from ~0.9:1 (1024px laptops) to ~1.9:1 (a 1920px
monitor with a short window), and the art is fitted with `object-cover`. Author
for the cropping range, not a single ratio.

**A 719×719 square background is the thing this replaces.** Squares
`object-cover`'d into a 1139×765 stage upscale ~1.6× and lose ~33% of their
height to the crop — that is exactly why a game reads as a small scene floating
in empty backdrop.

Measured stage sizes, for reference:

| Machine | innerHeight | Stage | Aspect |
|---|---|---|---|
| 1024px laptop | ~660 | 479 × 560 | 0.86:1 |
| MacBook Air 13" | ~810 | 1139 × 640 | 1.78:1 |
| MacBook Pro 14" | ~890 | 1139 × 720 | 1.58:1 |
| 1080p, Chrome maximized | ~940 | 1139 × 765 | 1.49:1 |
| 1440p, tall window | ~1350 | 1139 × 900 | 1.27:1 |

- **Master: 2560×1440 (16:9), WebP** (keep the layered source). The stage
  renders up to ~1139 CSS px wide (~2278 device px at 2× DPR); worst-case
  upscale is ~1.1×, imperceptible for painted backdrops.
- **Safe zone = the centered 1200×1200 square, minus ~5% inner margin.**
  Everything that matters lives here — it is what every player sees at every
  stage shape. (The narrowest stage, 0.86:1, is height-bound and shows only a
  centred 1238×1440 slice of the master — that is what sets the number.)
- **The ~680px flanks each side are croppable ambience.** They appear
  progressively as the window widens and must read cleanly sliced at any
  vertical line. No text, no critical detail near the cut range.
- **No baked-in vignettes or frames at the edges** — the HUD owns the frame.
- **Mobile stays 1:1**: the centered safe square *is* the mobile image. Export
  it separately (1440×1440) so phones don't download the 2560 master.
- **Cabinet games (slots etc.): deliver the machine as a separate layer from the
  backdrop.** Reel/hotspot coordinates are calibrated percentages of the
  artwork — anchoring them to a standalone cabinet element instead of a
  flattened image is what makes those games portable at all.

Remember the 10MB total asset budget (`SKILL.md` §8) when exporting.
