import React from "react";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Game } from "@/lib/games";
import { cn } from "@/lib/utils";
// Always import shared components via the @/ alias, never a relative path —
// on submission your folder moves to components/games/<your-game>/ and a
// "../shared/…" import would no longer resolve. See SKILL.md § 7.
import { HUD_PANEL_CARD_CLASS } from "@/components/shared/GameHud";
import BetAmountInput from "@/components/shared/BetAmountInput";
import { CustomSlider } from "@/components/shared/CustomSlider";
import ChipSelection, { Chip } from "@/components/shared/ChipSelection";

interface MyGameSetupCardProps {
    game: Game;
    /**
     * "hud"        = docked in the GameHud left panel (preferred layout).
     * "sidebar"    = legacy right column on desktop.
     * "standalone" = full-width card (mobile full-size layout / modal).
     */
    placement?: "hud" | "sidebar" | "standalone";
    className?: string;
    onPlay: () => void;
    onSpin: () => void;
    onRewatch: () => void;
    onReset: () => void;
    onPlayAgain: () => void;
    playAgainText?: string;
    currentView: 0 | 1 | 2; // 0 = setup, 1 = ongoing, 2 = finished

    // game related data
    betAmount: number;
    setBetAmount: (amount: number) => void;
    numberOfSpins: number;
    setNumberOfSpins: (spins: number) => void;
    isLoading: boolean;
    payout: number | null;
    spinsLeft: number;
    jackpotMultiplier: number;
    inReplayMode: boolean;

    account?: any;
    walletBalance: number;
    playerAddress?: string;
    isGamePaused?: boolean;
    profile?: any;
    minBet: number;
    maxBet: number;
}

const MAX_SPINS = 15;
const JACKPOT_AMOUNT_INFO =
    "The jackpot amount is the maximum payout you can get from a single spin.";
const MAX_PROFIT_INFO =
    "The maximum profit you can make from a single game is the jackpot amount minus the bet amount.";

const MyGameSetupCard: React.FC<MyGameSetupCardProps> = ({
    game,
    placement = "hud",
    className,
    onPlay,
    onSpin,
    onRewatch,
    onReset,
    onPlayAgain,
    playAgainText = "Play Again",
    currentView,
    betAmount,
    setBetAmount,
    numberOfSpins,
    setNumberOfSpins,
    isLoading,
    payout,
    spinsLeft,
    jackpotMultiplier,
    inReplayMode,
    account = undefined,
    playerAddress = undefined,
    walletBalance,
    isGamePaused = false,
    profile = undefined,
    maxBet,
    minBet,
}) => {
    const themeColorBackground = game.themeColorBackground;
    // const themeColorText = game.themeColorText;

    const usdMode = false;

    // Demo chip data for this example game
    const chips: Chip[] = [
        { id: "1", value: 1, image: "/shared/chips/chip_1.png" },
        { id: "5", value: 5, image: "/shared/chips/chip_5.png" },
        { id: "10", value: 10, image: "/shared/chips/chip_10.png" },
        { id: "25", value: 25, image: "/shared/chips/chip_25.png" },
    ];

    const [selectedChipId, setSelectedChipId] = React.useState<string | null>(null);

    const getCurrentWalletAmount = (): number => {
        return walletBalance;
    };

    const getCurrentWalletAmountMinusReduction = (): number => {
        return walletBalance;
    };

    const getCurrentWalletAmountString = (): string => {
        return `${walletBalance.toFixed(2)} APE`;
    };

    const SpinsLeftBlock = (hideOnDesktop: boolean) => {
        return (
            <div
                className={`${hideOnDesktop ? "lg:hidden" : "hidden lg:block"
                    } text-center font-nohemia`}
            >
                <p className="text-lg font-medium text-[#91989C]">Spins Left</p>
                <p
                    className="mt-2 font-semibold text-2xl sm:text-5xl"
                    style={{ color: themeColorBackground }}
                >
                    {spinsLeft} / {numberOfSpins}
                </p>
            </div>
        );
    };

    const getBetAmountText = (): string => {
        return `${(betAmount || 0).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;

    };

    const getTotalBuyInText = (): string => {
        return `${((betAmount || 0) * numberOfSpins).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;
    };

    const getTotalPayoutText = (): string => {
        return `${(payout || 0).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;
    };

    const getJackpotAmount = (): number => {
        const betPerSpin = betAmount / (numberOfSpins || 1);
        return betPerSpin * jackpotMultiplier;
    };

    const getJackpotAmountString = (): string => {
        const jackpotAmount = getJackpotAmount();
        return `${jackpotAmount.toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;
    };

    const betAmountPerSpinString = (): string => {
        const betAmountPerSpin = betAmount / (numberOfSpins || 1);

        return `${betAmountPerSpin.toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;
    };

    const getMaxProfitString = (): string => {
        return `${(getJackpotAmount() || 0).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;
    };

    const ShowInUsdAndStats = (invertOnDesktop: boolean) => {
        const showGreenText = (payout || 0) > (betAmount || 0) * numberOfSpins;

        return (
            <div
                className={`${invertOnDesktop ? "flex-col-reverse lg:flex-col" : "flex-col"
                    } font-roboto flex gap-12 lg:gap-8`}
            >
                {inReplayMode && (
                    <p
                        className="mt-2 font-semibold text-3xl sm:text-3xl text-center"
                        style={{ color: themeColorBackground }}
                    >
                        Replay Mode
                    </p>
                )}

                {/* show in usd option */}
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-foreground text-lg font-semibold">
                            Show Bets in USD
                        </p>
                        <p className="text-sm">
                            Your bets are valued in {usdMode ? "US Dollars" : "APE"}
                        </p>
                    </div>
                    <Switch
                        checked={usdMode}
                        onCheckedChange={() => {
                            // setUsdMode(!usdMode);
                        }}
                        aria-readonly
                    // themeColor={themeColorBackground}
                    />
                </div>

                {/* stats */}
                <div className="w-full flex flex-col items-center gap-2 font-medium text-xs text-[#91989C]">
                    {/* bet per spin */}
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Bet Per Spin</p>
                        <p className="text-right">{getBetAmountText()}</p>
                    </div>
                    {/* bet per spin */}
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Total Buy In</p>
                        <p className="text-right">{getTotalBuyInText()}</p>
                    </div>
                    {/* total pay out */}
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Total Pay Out</p>
                        <p className={`text-right ${showGreenText ? "text-success" : ""}`}>
                            {getTotalPayoutText()}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const ShowInUsdAndStatsFinalView = (invertOnDesktop: boolean) => {
        const showGreenText = (payout || 0) > (betAmount || 0) * numberOfSpins;

        return (
            <div
                className={`${invertOnDesktop ? "flex-col-reverse lg:flex-col" : "flex-col"
                    } font-roboto flex gap-12 lg:gap-8`}
            >
                {inReplayMode && (
                    <p
                        className="mt-2 font-semibold text-3xl sm:text-3xl text-center"
                        style={{ color: themeColorBackground }}
                    >
                        Replay Mode
                    </p>
                )}

                {/* show in usd option */}
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-foreground text-lg font-semibold">
                            Show Bets in USD
                        </p>
                        <p className="text-sm">Your bets are valued in US Dollars</p>
                    </div>
                    <Switch
                        checked={usdMode}
                        onCheckedChange={() => {
                            // setUsdMode(!usdMode);
                        }}
                        aria-readonly
                    // themeColor={themeColorBackground}
                    />
                </div>

                {/* stats */}
                <div className="w-full flex flex-col items-center gap-2 font-medium text-xs text-[#91989C]">
                    {/* bet per spin */}
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Bet Per Spin</p>
                        <p className="text-right">{getBetAmountText()}</p>
                    </div>
                    {/* bet per spin */}
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Total Buy In</p>
                        <p className="text-right">{getTotalBuyInText()}</p>
                    </div>
                    {/* total pay out */}
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Total Pay Out</p>
                        <p className={`text-right ${showGreenText ? "text-success" : ""}`}>
                            {getTotalPayoutText()}
                        </p>
                    </div>
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Wallet Balance</p>
                        <p className="text-right">{getCurrentWalletAmountString()}</p>
                    </div>
                </div>
            </div>
        );
    };

    const canReplay = (): boolean => {
        if (!playerAddress) {
            return false;
        }
        if (!account) {
            return false;
        }
        if (inReplayMode) {
            return false;
        }
        return playerAddress.toLowerCase() === account.address.toLowerCase();
    };

    return (
        <Card
            className={cn(
                "p-6 flex flex-col",
                placement === "sidebar" && "lg:basis-1/3",
                // Docked in the HUD panel: the frame owns the chrome on lg+.
                // Compose extras AFTER the constant so twMerge resolves in your
                // favour (e.g. cn(..., HUD_PANEL_CARD_CLASS, "lg:gap-3")).
                placement === "hud" && HUD_PANEL_CARD_CLASS,
                className,
            )}
        >
            {currentView === 0 && (
                <>
                    <CardContent className="font-roboto">
                        {/* place your bet button - mobile */}
                        <Button
                            onClick={onPlay}
                            className="lg:hidden w-full"
                            style={{
                                backgroundColor: themeColorBackground,
                                borderColor: themeColorBackground,
                            }}
                            disabled={betAmount === null || betAmount <= 0 || isGamePaused}
                        >
                            Place Your Bet
                        </Button>

                        {/* bet amount */}
                        <div className="mt-5">
                            <BetAmountInput
                                min={0}
                                max={getCurrentWalletAmountMinusReduction()}
                                step={0.1}
                                value={betAmount}
                                onChange={setBetAmount}
                                balance={getCurrentWalletAmount()}
                                usdMode={usdMode}
                                setUsdMode={() => { }}
                                disabled={isLoading}
                                themeColorBackground={themeColorBackground}
                            />
                        </div>

                        {/* demo chip selection - note that this would not be used with the BetAmountInput */}
                        <ChipSelection
                            chips={chips}
                            selectedChipId={selectedChipId}
                            onChipSelect={(chip) => setSelectedChipId(chip.id)}
                            onRemoveAllBets={() => setSelectedChipId(null)}
                        />

                        {/* number of spins */}
                        <div className="mt-8">
                            <CustomSlider
                                label="Number of Spins"
                                min={1}
                                max={MAX_SPINS}
                                step={1}
                                value={numberOfSpins}
                                onChange={setNumberOfSpins}
                                presets={[5, 10, 15]}
                                themeColor={themeColorBackground}
                            />
                        </div>
                    </CardContent>

                    <div className="grow"></div>

                    <CardFooter className="mt-8 w-full flex flex-col font-roboto">
                        {/* stats */}
                        <div className="w-full flex flex-col items-center gap-2 font-medium text-xs text-[#91989C]">
                            <div className="w-full flex justify-between items-center gap-2">
                                <p>Jackpot Multiplier</p>
                                <p className="text-right">{jackpotMultiplier}x</p>
                            </div>
                            {/* bet amount per spin */}
                            <div className="w-full flex justify-between items-center gap-2">
                                <p>Bet Amount per Spin</p>
                                <p className="text-right">{betAmountPerSpinString()}</p>
                            </div>

                            {/* jackpot amount */}
                            <div className="w-full flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <p>Jackpot Amount</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info size={16} />
                                            </TooltipTrigger>
                                            <TooltipContent
                                            // themeColor={themeColorBackground}
                                            // themeColorText={themeColorText}
                                            >
                                                <p>{JACKPOT_AMOUNT_INFO}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <p className="text-right">{getJackpotAmountString()}</p>
                            </div>
                            {/* max profit per game */}
                            <div className="w-full flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <p>Max Profit per Game</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info size={16} />
                                            </TooltipTrigger>
                                            <TooltipContent
                                            // themeColor={themeColorBackground}
                                            // themeColorText={themeColorText}
                                            >
                                                <p>{MAX_PROFIT_INFO}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <p className="text-right">{getMaxProfitString()}</p>
                            </div>
                            <div className="w-full flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <p>Max Bet Per Game</p>
                                </div>
                                <p className="text-right">
                                    {maxBet.toLocaleString([], { maximumFractionDigits: 0 })} APE
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={onPlay}
                            className="hidden lg:flex mt-6 w-full"
                            style={{
                                backgroundColor: themeColorBackground,
                                borderColor: themeColorBackground,
                            }}
                            disabled={betAmount === null || betAmount <= 0 || isGamePaused}
                        >
                            Place Your Bet
                        </Button>
                    </CardFooter>
                </>
            )}
            {currentView === 1 && (
                <CardContent className="grow font-roboto flex flex-col-reverse lg:flex-col lg:justify-between gap-8">
                    {/* show in usd option + stats */}
                    {ShowInUsdAndStats(true)}

                    {/* spins left (desktop) */}
                    {SpinsLeftBlock(false)}

                    {/* spins left + spin button */}
                    <div className="flex lg:flex-col justify-evenly items-center">
                        {/* spins left (mobile + tablet) */}
                        {SpinsLeftBlock(true)}

                        {/* spin button + auto spin */}
                        <div className="font-roboto flex flex-col items-center gap-3">
                            {game.advanceToNextStateAsset ? (
                                <button onClick={onSpin} className="w-full">
                                    <Image
                                        src={game.advanceToNextStateAsset}
                                        alt="Spin Button"
                                        width={196.5}
                                        height={179.82}
                                        className="transition-transform duration-100 ease-out active:scale-97 w-[109px] h-[100px] sm:w-[131px] sm:h-[120px] lg:w-[184px] lg:h-[168.35px]"
                                    />
                                </button>
                            ) : (
                                <Button onClick={onSpin} className="w-full">
                                    Spin
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            )}
            {currentView === 2 && (
                <CardContent className="grow font-roboto flex flex-col lg:justify-between gap-8">
                    {/* action buttons - mobile */}
                    <div className="lg:hidden">
                        {canReplay() ? (
                            <Button
                                className="w-full"
                                style={{
                                    backgroundColor: themeColorBackground,
                                    borderColor: themeColorBackground,
                                }}
                                onClick={onPlayAgain}
                                disabled={isGamePaused}
                            >
                                {playAgainText}
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                variant="secondary"
                                style={{
                                    backgroundColor: themeColorBackground,
                                    borderColor: themeColorBackground,
                                }}
                                onClick={onRewatch}
                            >
                                Rewatch Spins
                            </Button>
                        )}

                        <Button
                            className="w-full mt-3"
                            variant="secondary"
                            onClick={onReset}
                        >
                            Change Bet
                        </Button>
                    </div>

                    {/* show in usd option + stats */}
                    {ShowInUsdAndStatsFinalView(false)}

                    {/* spins left */}
                    {SpinsLeftBlock(false)}

                    {/* replay + claim buttons */}
                    <div className="flex lg:flex-col justify-evenly items-center">
                        {/* spins left (mobile + tablet) */}
                        {SpinsLeftBlock(true)}
                    </div>

                    {/* spin button + auto spin */}
                    <CardFooter className="w-full hidden lg:block">
                        <div className="w-full flex flex-col gap-4">
                            {canReplay() ? (
                                <Button
                                    className="w-full"
                                    style={{
                                        backgroundColor: themeColorBackground,
                                        borderColor: themeColorBackground,
                                    }}
                                    onClick={onPlayAgain}
                                    disabled={isGamePaused}
                                >
                                    {playAgainText}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    style={{
                                        backgroundColor: themeColorBackground,
                                        borderColor: themeColorBackground,
                                    }}
                                    onClick={onRewatch}
                                >
                                    Rewatch Spins
                                </Button>
                            )}

                            <Button
                                className="w-full"
                                variant="secondary"
                                onClick={onReset}
                            >
                                Change Bet
                            </Button>
                        </div>
                    </CardFooter>
                </CardContent>
            )}
        </Card>
    );
};

export default MyGameSetupCard;
