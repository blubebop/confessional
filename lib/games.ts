// Game type - DO NOT EDIT
export type Game = {
    title: string;
    description: string;
    gameAddress: string;
    gameBackground: string;
    animatedBackground?: string;
    card: string;
    banner: string;
    advanceToNextStateAsset?: string;
    themeColorBackground: string;
    song?: string;
    payouts: PayoutStructure;
    // ... other fields that Ape Church uses
};

// The PayoutStructure type defines how payouts are mapped for a game.
// This structure is flexible: the nested keys and payout values may vary depending on the specific game and its payout math.
// Each game can design its own payout interpretation and mapping logic according to its rules.
export type PayoutStructure = {
    [key: number]: {
        [key: number]: {
            [key: number]: number;
        };
    };
};

// Function to get the payout
export const getPayout = (
    payouts: PayoutStructure,
    result0: number,
    result1: number,
    result2: number
): number => {
    return payouts[result0]?.[result1]?.[result2] || 0;
};

// Helper function to generate random bytes
export const randomBytes = (amount: number) =>
    crypto.getRandomValues(new Uint8Array(amount));