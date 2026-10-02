"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPayout, randomBytes, Game } from "@/lib/games";
import GameWindow from "@/components/shared/GameWindow";
import WideGameWindow from "@/components/shared/WideGameWindow";
import GameHud from "@/components/shared/GameHud";
import MyGameWindow from "./MyGameWindow";
import MyGameSetupCard from "./MyGameSetupCard";
import MyGameInGameOverlay from "./MyGameInGameOverlay";
import { myGame, myGameLayout } from "./myGameConfig";
import { bytesToHex, Hex } from "viem";
import { toast } from "sonner";
// import './my-game.styles.css' use if needed

interface MyGameComponentProps {
    /** Passed by the template app page; omitted on the submissions preview site. */
    game?: Game;
}

const MyGameComponent: React.FC<MyGameComponentProps> = ({ game: gameProp }) => {
    const game = gameProp ?? myGame;
    const isHudLayout = myGameLayout === "hud";
    const isFullSizeLayout = myGameLayout === "full-size";
    const router = useRouter();
    const searchParams = useSearchParams();
    const replayIdString = searchParams.get("id");
    const walletBalance = 25; // TODO: get wallet balance from wallet
    const [isGameOngoing, setIsGameOngoing] = React.useState<boolean>(false); // used for hiding global balance when game is ongoing
    const [currentView, setCurrentView] = React.useState<0 | 1 | 2>(0); // 0: setup view, 1: ongoing view, 2: game over view
    const [showSetupModal, setShowSetupModal] = React.useState<boolean>(false);

    // Game related state and initializations
    const [betAmount, setBetAmount] = React.useState<number>(0);
    const [numberOfSpins, setNumberOfSpins] = React.useState<number>(10);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [payout, setPayout] = React.useState<number | null>(null);
    const [currentSpinIndex, setCurrentSpinIndex] = React.useState<number>(0);
    const [gameOver, setGameOver] = React.useState<boolean>(false);
    const [isSpinning, setIsSpinning] = React.useState<boolean>(false);
    const shouldShowPNL: boolean = !!payout && payout > 1 && payout > betAmount;
    const playAgainText = `Play Again (${numberOfSpins} More Spins)`

    // Game ID and Random Word - used for replay mode
    const [currentGameId, setCurrentGameId] = useState<bigint>(
        replayIdString == null
            ? BigInt(bytesToHex(new Uint8Array(randomBytes(32))))
            : BigInt(replayIdString)
    );
    const [userRandomWord, setUserRandomWord] = useState<Hex>(
        bytesToHex(new Uint8Array(randomBytes(32)))
    );
    // Set current game ID from replay ID string if available
    useEffect(() => {
        if (replayIdString !== null) {
            if (replayIdString.length > 2) {
                setIsLoading(true);
                setCurrentGameId(BigInt(replayIdString));
            }
        }
    }, [replayIdString]);



    // HELPER FUNCTIONS
    const formatSpinResults = (): number[][] => {
        return [[0, 0, 0]];
    };

    const getSpinsLeft = (): number => {
        return numberOfSpins - currentSpinIndex;
    };

    const getActiveBetAmount = (): number => {
        return betAmount;
    };

    const getTotalPayout = (): number => {
        return payout ?? 0;
    };


    // GAME FUNCTIONS
    const playGame = async (
        gameId?: bigint,
        randomWord?: Hex,
    ) => {
        // update loading state and game ongoing state
        setIsLoading(true);
        setIsGameOngoing(true);

        // Use provided gameId and randomWord if available, otherwise use state values
        const gameIdToUse = gameId ?? currentGameId;
        const randomWordToUse = randomWord ?? userRandomWord;

        // simulate send transaction and wait for receipt
        try {
            const receiptSuccess = true;

            if (receiptSuccess) {
                toast.success("Transaction complete!");
                setTimeout(() => {
                    setIsLoading(false);
                    setCurrentView(1); // Set to ongoing view
                }, 1000);
            }
            else {
                console.error("Something went wrong..");
                toast.info("Something went wrong..");
                setIsLoading(false);
                setIsGameOngoing(false);
            }
        }
        catch (error) {
            // First, check for the specific error conditions to ignore
            if (
                (error instanceof Error &&
                    error.message.includes("Transaction not found")) ||
                (typeof error === "string" && error.includes("Transaction not found"))
            ) {
                console.warn("Ignoring a known timeout error.");
                return; // Exit silently
            }

            // If the error was not ignored, handle it as a real failure
            console.error("An unexpected error occurred:", error);
            toast.error("An unexpected error occurred.");
            setIsLoading(false);
            setIsGameOngoing(false);
        }
    };

    const handleStateAdvance = () => {
        if (isSpinning == true) {
            return;
        }

        if (currentSpinIndex < numberOfSpins) {
            if (gameOver) {
                setGameOver(false);
                setIsGameOngoing(true);
            }
            setIsSpinning(true);
        }

        // simulate spin outcome - generate random numbers between 0-5 for each slot
        const spinOutcome = [
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 6)
        ];
        setTimeout(() => {
            const betAmount = getActiveBetAmount();
            setIsSpinning(false);

            // Calculate payout for this spin: (betAmount * payoutFactor) / 10_000
            const payoutFactor = getPayout(game.payouts, spinOutcome[0], spinOutcome[1], spinOutcome[2]);
            const spinPayout = (betAmount * payoutFactor) / 10_000;

            // Update spin index
            const nextSpinIndex = currentSpinIndex + 1;
            setCurrentSpinIndex(nextSpinIndex);

            // Accumulate payout
            setPayout((prevPayout) => {
                if (prevPayout == null) {
                    return spinPayout;
                } else {
                    return prevPayout + spinPayout;
                }
            });

            // Check if this was the last spin
            if (nextSpinIndex >= numberOfSpins) {
                setCurrentView(2);
                const wonPayout = spinPayout > 0;
                if (wonPayout) {
                    // add time for payout animation to end
                    setTimeout(() => {
                        setGameOver(true);
                        setIsGameOngoing(false);
                    }, 1500);
                } else {
                    setTimeout(() => {
                        setGameOver(true);
                        setIsGameOngoing(false);
                    }, 800);
                }
            }
        }, 1000);
    };

    const handleReset = (isPlayingAgain: boolean = false) => {
        console.log("Reset game");

        // Generate new game ID and user word if not playing again
        if (isPlayingAgain === false) {
            const newGameId = BigInt(bytesToHex(new Uint8Array(randomBytes(32))));
            const newUserWord = bytesToHex(new Uint8Array(randomBytes(32)));
            setCurrentGameId(newGameId);
            setUserRandomWord(newUserWord);
        }

        // Reset game states
        setIsSpinning(false);
        setCurrentView(0); // Set to setup view
        setPayout(null);
        setGameOver(false);
        setCurrentSpinIndex(0);
        setIsGameOngoing(false);
        setShowSetupModal(false);

        // Reset replay ID if in replay mode
        if (replayIdString !== null) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("id");
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    };

    const handlePlayAgain = async () => {
        console.log("Play Again button clicked");

        // Define the new gameId first as a const
        const newGameId = BigInt(bytesToHex(new Uint8Array(randomBytes(32))));
        const newUserWord = bytesToHex(new Uint8Array(randomBytes(32)));

        // Set the state for the new gameId and userRandomWord
        setCurrentGameId(newGameId);
        setUserRandomWord(newUserWord);

        // Reset game states (without generating new gameId/userRandomWord)
        handleReset(true);

        // Call playGame with the new gameId and userRandomWord
        await playGame(newGameId, newUserWord);
    };

    const handleRewatch = () => {
        console.log("Replay button clicked");

        setCurrentView(1); // Set to ongoing view
        setCurrentSpinIndex(0);
        setPayout(null);
        setGameOver(false);
        setIsSpinning(false);
        setIsGameOngoing(false);
    };

    const setupCardProps = {
        game,
        onPlay: async () => await playGame(),
        onSpin: handleStateAdvance,
        onRewatch: handleRewatch,
        onReset: () => handleReset(false),
        onPlayAgain: async () => await handlePlayAgain(),
        playAgainText,
        currentView,
        betAmount: currentView == 0 ? betAmount : getActiveBetAmount(),
        setBetAmount,
        numberOfSpins,
        setNumberOfSpins,
        isLoading,
        payout,
        spinsLeft: getSpinsLeft(),
        jackpotMultiplier: getPayout(game.payouts, 0, 0, 0) / 10000,
        inReplayMode: replayIdString !== null,
        account: undefined,
        walletBalance,
        playerAddress: undefined,
        isGamePaused: false,
        profile: undefined,
        minBet: 1,
        maxBet: 100,
    };

    const gameWindowContent = (
        <MyGameWindow
            game={game}
            isSpinning={isSpinning}
            currentSpinIndex={currentSpinIndex}
            gameCompleted={gameOver}
            spinResults={formatSpinResults()}
            betAmount={getActiveBetAmount()}
            payoutAmount={getTotalPayout()}
        />
    );

    const gameWindowShellProps = {
        game,
        currentGameId,
        isLoading,
        isGameFinished: gameOver,
        onPlayAgain: handlePlayAgain,
        playAgainText,
        onRewatch: handleRewatch,
        onReset: () => handleReset(false),
        betAmount: getActiveBetAmount(),
        payout,
        inReplayMode: replayIdString !== null,
        isUserOriginalPlayer: true,
        showPNL: shouldShowPNL,
        isGamePaused: false,
        resultModalDelayMs: 1000,
    };

    // PREFERRED LAYOUT — the unified game HUD (docs/GAME-HUD.md).
    // GameHud is the two-column wrapper now: the setup card goes in `panel`,
    // the window goes in `children` with `hudMode`. Anything that used to sit
    // below the game (history, rules) stays OUTSIDE the frame.
    if (isHudLayout) {
        return (
            <div>
                <GameHud
                    title={game.title}
                    panel={<MyGameSetupCard {...setupCardProps} placement="hud" />}
                    // Optional per-game stage constraint. A content-heavy scene can
                    // set a floor (`lg:min-h-[600px]`); art authored at a fixed
                    // aspect overrides the height entirely
                    // (`lg:h-auto lg:aspect-[4/3] lg:max-h-[860px]`).
                    stageClassName={undefined}
                >
                    <GameWindow {...gameWindowShellProps} hudMode>
                        {gameWindowContent}
                    </GameWindow>
                </GameHud>

                {/* Game history / rules sections go here — outside the frame. */}
            </div>
        );
    }

    if (isFullSizeLayout) {
        return (
            <div>
                <WideGameWindow
                    {...gameWindowShellProps}
                    skipDefaultBackground={false}
                >
                    {gameWindowContent}
                    <MyGameInGameOverlay
                        game={game}
                        currentView={currentView}
                        isLoading={isLoading}
                        betAmount={betAmount}
                        setBetAmount={setBetAmount}
                        numberOfSpins={numberOfSpins}
                        payout={payout}
                        spinsLeft={getSpinsLeft()}
                        walletBalance={walletBalance}
                        onPlay={async () => await playGame()}
                        onSpin={handleStateAdvance}
                        onOpenCustomize={() => setShowSetupModal(true)}
                    />
                </WideGameWindow>

                {/* Mobile: setup card below the game window */}
                <MyGameSetupCard
                    {...setupCardProps}
                    placement="standalone"
                    className="md:hidden mt-4"
                />

                {/* Desktop: customize modal for advanced bet options */}
                {showSetupModal && (
                    <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="relative w-full max-w-md">
                            <button
                                type="button"
                                onClick={() => setShowSetupModal(false)}
                                className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-medium"
                            >
                                Close
                            </button>
                            <MyGameSetupCard
                                {...setupCardProps}
                                placement="standalone"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-10">
                <GameWindow {...gameWindowShellProps}>
                    {gameWindowContent}
                </GameWindow>

                <MyGameSetupCard {...setupCardProps} placement="sidebar" />
            </div>
        </div>
    );
};

export default MyGameComponent;
