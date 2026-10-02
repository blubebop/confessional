"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Docking treatment for a setup card rendered in the GameHud panel: on lg+
 * the frame owns the chrome, so the card drops its own border/rounding/
 * surface/shadow, fills the panel column (min-h so the column can actually
 * scroll — h-full would silently clip), and runs on tighter padding. Compose
 * with card-specific extras (e.g. `lg:bg-none` for gradient surfaces).
 * Below lg this is inert — the card stays the classic floating card.
 */
export const HUD_PANEL_CARD_CLASS =
    "lg:min-h-full lg:basis-auto lg:p-4 lg:border-0 lg:rounded-none lg:bg-transparent lg:shadow-none";

/**
 * Unified desktop game frame ("HUD") — the preferred layout for new games.
 *
 * One bordered container holding a slim title bar, a narrow left-docked
 * control panel (Stake-style) and a wide game stage that gets the bulk of the
 * width:
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ Game Title            [accessory]                        │  ← h-10 title bar
 *   ├───────────────┬──────────────────────────────────────────┤
 *   │  panel        │  stage                                   │
 *   │  300 / 340px  │  flex-1, h = clamp(560, 100vh-170, 900)  │
 *   │  scrolls      │  (children: GameWindow hudMode)          │
 *   └───────────────┴──────────────────────────────────────────┘
 *
 * Below lg nothing changes versus the classic layout: title row, then the
 * game window, then the controls stacked underneath, no outer frame — the
 * square mobile presentation is deliberately untouched. Every HUD style here
 * is `lg:`-prefixed for that reason.
 *
 * The child GameWindow must be rendered with `hudMode` so it fills the stage
 * instead of drawing its own border and sizing itself off its background art.
 *
 * See docs/GAME-HUD.md for the full spec, sizing rules and gotchas.
 */
interface GameHudProps {
    /** Game title — rendered in the HUD bar, replacing the page-level <h1>. */
    title: string;
    /** Sits beside the title (the platform injects a leaderboard trigger here). */
    accessory?: React.ReactNode;
    /** Bet/setup controls. Docked left on lg+, stacked below the game on mobile.
     *  The panel column scrolls internally if taller than the stage. */
    panel: React.ReactNode;
    /** Extra classes for the stage wrapper — add constraints (e.g. a
     *  lg:min-h floor for content-heavy scenes) or override the default
     *  viewport-driven height entirely with an aspect class. */
    stageClassName?: string;
    /** The GameWindow (with hudMode) plus any siblings scoped to the stage. */
    children: React.ReactNode;
}

const GameHud: React.FC<GameHudProps> = ({
    title,
    accessory,
    panel,
    stageClassName,
    children,
}) => {
    // On the platform, /embed/[slug] renders games inside ~380px floating
    // mini-windows that never had a page h1, so the HUD bar must not smuggle
    // one in there either. Always false while developing in this template.
    const pathname = usePathname();
    const isMiniEmbed = (pathname ?? "").startsWith("/embed");

    return (
        <div className="w-full lg:overflow-hidden lg:rounded-[12px] lg:border-[3px] lg:border-[#2A3640] lg:bg-[#12181C]">
            {/* Title bar: mobile keeps the classic page-title row; desktop gets a
                slim in-frame bar, reclaiming the vertical space the h1 used to eat.

                flex-wrap + gap-y matter below lg only: a game with more than one
                accessory overflowed a 390px screen instead of dropping to a
                second line. row-gap is inert until something wraps, so
                single-accessory games are unchanged. The lg bar is a
                fixed-height strip and never wraps. */}
            {!isMiniEmbed && (
                <div className="mb-2 flex flex-row flex-wrap items-center gap-y-2 sm:mb-4 lg:mb-0 lg:h-10 lg:flex-nowrap lg:gap-y-0 lg:border-b lg:border-[#2A3640] lg:px-5">
                    <h1 className="mr-2 text-3xl font-semibold lg:text-lg">{title}</h1>
                    {accessory}
                </div>
            )}

            <div className="flex flex-col gap-4 sm:gap-8 lg:flex-row lg:gap-0">
                {/* Control panel: fixed narrow column docked to the frame on desktop.
                    The inner absolute wrapper pins the column to the stage's height so
                    overly tall setup content scrolls instead of stretching the frame.
                    300px at lg because the frame is only ~830px wide at 1024–1280. */}
                <div className="relative order-2 lg:order-1 lg:w-[300px] lg:shrink-0 lg:border-r-[3px] lg:border-[#2A3640] xl:w-[340px]">
                    <div className="lg:absolute lg:inset-0 lg:overflow-y-auto">{panel}</div>
                </div>

                {/* Stage: the game gets the remaining width, and its height comes from
                    the VIEWPORT, not a fixed aspect — procedural scenes have no art
                    aspect to honour, and a hard 16:9 left the stage shorter than the
                    classic square window on laptops. The clamp keeps short windows
                    usable and stops ultra-tall monitors from stretching the scene
                    absurdly; all three figures are tuned in globals.css
                    (--game-hud-stage-*) because the offset is derived from the chrome
                    stacked above the frame and has to move with it.

                    Art-locked games override the height via stageClassName, e.g.
                    "lg:h-auto lg:aspect-[4/3] lg:max-h-[860px]". */}
                <div
                    className={cn(
                        "relative order-1 w-full lg:order-2 lg:min-w-0 lg:flex-1 lg:h-[clamp(var(--game-hud-stage-min),calc(100vh_-_var(--game-hud-stage-offset)),var(--game-hud-stage-max))]",
                        stageClassName
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default GameHud;
