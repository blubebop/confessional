"use client";

import React from "react";
import Image from "next/image";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Game } from "@/lib/games";

const BET_PRESETS = [10, 15, 20, 30];

interface MyGameInGameOverlayProps {
    game: Game;
    currentView: 0 | 1 | 2;
    isLoading: boolean;
    isGamePaused?: boolean;

    betAmount: number;
    setBetAmount: (amount: number) => void;
    numberOfSpins: number;
    payout: number | null;
    spinsLeft: number;
    walletBalance: number;

    onPlay: () => void;
    onSpin: () => void;
    onOpenCustomize: () => void;
}

const MyGameInGameOverlay: React.FC<MyGameInGameOverlayProps> = ({
    game,
    currentView,
    isLoading,
    isGamePaused = false,
    betAmount,
    setBetAmount,
    numberOfSpins,
    payout,
    spinsLeft,
    walletBalance,
    onPlay,
    onSpin,
    onOpenCustomize,
}) => {
    const themeColorBackground = game.themeColorBackground;

    const formatApe = (amount: number): string =>
        `${amount.toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })} APE`;

    const betPerSpin = betAmount / (numberOfSpins || 1);
    const totalWagered = betPerSpin * (numberOfSpins - spinsLeft);

    if (currentView === 0 && !isLoading) {
        return (
            <div className="hidden md:flex absolute bottom-0 left-0 right-0 z-40 items-end justify-center pb-3 md:pb-5 pointer-events-none">
                <div className="pointer-events-auto flex flex-col items-start gap-1 bg-[#0a1628]/90 border border-[#3a5a8a] rounded-xl px-3 md:px-5 py-2 md:py-3 backdrop-blur-md shadow-lg shadow-black/40">
                    <span className="text-[10px] sm:text-xs text-[#6a8aaa] font-medium tabular-nums pl-0.5">
                        Balance: {formatApe(walletBalance)}
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                        {BET_PRESETS.map((preset) => {
                            const isActive = Math.abs(betAmount - preset) < 0.01;
                            const canAfford = preset <= walletBalance;
                            return (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setBetAmount(preset)}
                                    disabled={!canAfford || isGamePaused}
                                    className={`cursor-pointer px-2.5 sm:px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 ${
                                        isActive
                                            ? "bg-[#3B82F6] text-white ring-2 ring-[#60a5fa] shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                            : "bg-[#162a48]/80 text-[#a0d7ff] hover:bg-[#1e3a5f] border border-[#2a4a6a]"
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    {preset}
                                    <span className="hidden sm:inline text-[10px] font-medium opacity-60 ml-0.5">
                                        APE
                                    </span>
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={onOpenCustomize}
                            className="cursor-pointer px-2.5 sm:px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#162a48]/80 text-[#a0d7ff] hover:bg-[#1e3a5f] border border-[#2a4a6a] border-dashed transition-colors"
                            title="Customize bet and spins"
                        >
                            <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 inline-block" />
                        </button>

                        <div className="w-px h-6 md:h-8 bg-[#3a5a8a]/60 mx-0.5" />

                        <button
                            type="button"
                            onClick={onPlay}
                            disabled={betAmount <= 0 || isGamePaused}
                            className="cursor-pointer px-4 sm:px-5 md:px-7 py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563eb] transition-colors shadow-md shadow-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: themeColorBackground }}
                        >
                            Buy {numberOfSpins} Spins
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentView === 1) {
        return (
            <>
                <div className="absolute right-2 md:right-4 z-30 pointer-events-none top-[8%] md:top-[45%]">
                    <div className="bg-[#0a1628]/85 border border-[#3a5a8a]/70 rounded-lg px-2 md:px-4 py-1 md:py-3 backdrop-blur-sm shadow-lg shadow-black/30 min-w-[80px] md:min-w-[150px]">
                        <div className="flex items-center justify-between gap-2 md:gap-3 mb-0 md:mb-2">
                            <span className="text-[8px] md:text-[11px] font-medium text-[#6a8aaa] uppercase tracking-wider">
                                Won
                            </span>
                            <span
                                className={`text-[10px] md:text-sm font-bold tabular-nums ${
                                    (payout ?? 0) > 0 ? "text-green-400" : "text-[#a0d7ff]"
                                }`}
                            >
                                {formatApe(payout ?? 0)}
                            </span>
                        </div>

                        <div className="hidden md:block h-px bg-[#3a5a8a]/40 mb-1.5 md:mb-2" />

                        <div className="hidden md:flex items-center justify-between gap-3 mb-1">
                            <span className="text-[9px] md:text-[11px] font-medium text-[#6a8aaa] uppercase tracking-wider">
                                Wagered
                            </span>
                            <span className="text-[10px] md:text-xs font-semibold tabular-nums text-[#8ab0d4]">
                                {formatApe(totalWagered)}
                            </span>
                        </div>

                        <div className="hidden md:flex items-center justify-between gap-3">
                            <span className="text-[9px] md:text-[11px] font-medium text-[#6a8aaa] uppercase tracking-wider">
                                Per Spin
                            </span>
                            <span className="text-[10px] md:text-xs font-semibold tabular-nums text-[#8ab0d4]">
                                {formatApe(betPerSpin)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-40 flex items-end justify-center pb-3 md:pb-5 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-3 bg-[#0a1628]/90 border border-[#3a5a8a] rounded-xl px-4 md:px-6 py-2 md:py-3 backdrop-blur-md shadow-lg shadow-black/40">
                        <div className="text-center font-nohemia hidden sm:block">
                            <p className="text-[10px] text-[#6a8aaa] uppercase tracking-wider">
                                Spins Left
                            </p>
                            <p
                                className="font-semibold text-lg md:text-xl tabular-nums"
                                style={{ color: themeColorBackground }}
                            >
                                {spinsLeft} / {numberOfSpins}
                            </p>
                        </div>

                        <div className="w-px h-8 bg-[#3a5a8a]/60 hidden sm:block" />

                        {game.advanceToNextStateAsset ? (
                            <button onClick={onSpin} className="cursor-pointer">
                                <Image
                                    src={game.advanceToNextStateAsset}
                                    alt="Spin Button"
                                    width={196.5}
                                    height={179.82}
                                    className="transition-transform duration-100 ease-out active:scale-97 w-[80px] h-[73px] md:w-[120px] md:h-[110px]"
                                />
                            </button>
                        ) : (
                            <Button onClick={onSpin} className="min-w-[100px]">
                                Spin
                            </Button>
                        )}
                    </div>
                </div>
            </>
        );
    }

    return null;
};

export default MyGameInGameOverlay;
