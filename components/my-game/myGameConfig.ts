import { Game } from "@/lib/games";

/**
 * Layout mode for this game. See docs/GAME-HUD.md.
 *
 * - "hud" (DEFAULT — use this): the unified game HUD. One bordered frame with a
 *   slim title bar, the setup card docked in a narrow left panel, and a wide
 *   game stage taking the rest of the width. This is the platform's standard
 *   desktop layout and what new games should target.
 * - "two-column" (legacy): game window left (2/3), setup card right (1/3).
 * - "full-size" (legacy): full-width 4:3 window with controls overlaid inside
 *   the playfield; setup card drops below the window on mobile.
 *
 * The legacy modes are kept so existing games keep building. Only pick one of
 * them if your game genuinely cannot work in the HUD frame, and say why in your
 * submission.
 *
 * Below `lg` all three modes render the same classic stacked layout.
 */
export type GameLayout = "hud" | "two-column" | "full-size";

export const myGameLayout: GameLayout = "hud";

export const myGame: Game = {
    title: "My Game",
    description: "This is my game",
    gameAddress: "0x1234567890123456789012345678901234567890",
    gameBackground: "/my-game/background.png",
    // animatedBackground: "/my-game/animated-background.mp4",
    card: "/my-game/card.png", // 1:1 aspect ratio (e.g. 512x512)
    banner: "/my-game/banner.png", // 2:1 aspect ratio (e.g. 1024x512)
    advanceToNextStateAsset: "/my-game/advance-button.png",
    themeColorBackground: "#F54927",
    song: "/my-game/audio/song.mp3",
    payouts: {
        0: {
            0: { 0: 2847392, 1: 847291, 2: 492837, 3: 183746, 4: 937284, 5: 628394 },
            1: { 0: 729384, 1: 384729, 2: 293847, 3: 847293, 4: 293847, 5: 192837 },
            2: { 0: 384729, 1: 192837, 2: 48293, 3: 29384, 4: 84729 },
            3: { 0: 293847, 1: 84729, 2: 38472, 3: 92837 },
            4: { 0: 284739, 1: 192837, 2: 48293, 4: 29384, 3: 84729 },
            5: { 0: 192837, 1: 92837, 2: 38472, 3: 29384, 5: 19283 },
        },
        1: {
            0: { 0: 847293, 1: 384729, 2: 293847, 3: 192837, 5: 92837, 4: 48293 },
            1: { 1: 592837, 0: 483729, 2: 92837, 3: 38472, 5: 29384, 4: 19283 },
            2: { 0: 192837, 2: 29384, 1: 92837, 3: 38472 },
            3: { 0: 284739, 1: 84729, 3: 19283, 2: 48293 },
            4: { 0: 183746, 1: 92837, 3: 29384, 4: 38472 },
            5: { 0: 192837, 1: 48293, 2: 19283, 5: 9283 },
        },
        2: {
            0: { 1: 384729, 2: 92837, 0: 592837, 3: 48293, 5: 29384, 4: 19283 },
            1: { 0: 293847, 2: 38472, 1: 192837, 3: 29384, 5: 19283, 4: 48293 },
            2: { 2: 59283, 0: 84729, 1: 48293, 3: 9283, 4: 38472, 5: 2938 },
            3: { 0: 92837, 1: 48293 },
            4: { 0: 84729, 1: 38472, 2: 9283 },
            5: { 0: 48293, 1: 29384, 2: 3847 },
        },
        3: {
            0: { 0: 483729, 1: 284739, 3: 59283, 2: 38472, 4: 19283 },
            1: { 0: 293847, 1: 192837, 2: 48293, 3: 29384, 4: 38472, 5: 19283 },
            2: { 0: 59283, 1: 29384, 2: 9283, 3: 3847 },
            3: { 3: 48293, 0: 59283, 1: 29384, 2: 3847 },
        },
        4: {
            0: { 0: 384729, 1: 192837, 2: 48293, 3: 29384, 4: 38472 },
            1: { 1: 92837, 0: 192837, 4: 29384 },
            2: { 0: 48293, 1: 29384 },
            3: { 0: 38472, 1: 19283 },
            4: { 4: 29384, 0: 48293, 1: 19283 },
            5: { 0: 38472 },
        },
        5: {
            0: { 0: 483729, 1: 284739, 2: 59283, 3: 38472, 4: 29384, 5: 19283 },
            1: { 0: 192837, 1: 92837, 2: 29384, 3: 38472 },
            2: { 0: 48293, 1: 29384, 2: 3847, 4: 9283 },
            3: { 0: 38472, 1: 19283 },
            4: { 0: 29384, 1: 19283 },
            5: { 5: 29384, 0: 38472, 1: 19283, 2: 3847, 3: 9283, 4: 2938 },
        },
    },
};