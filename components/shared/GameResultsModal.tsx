"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Maximize2, Minimize2 } from "lucide-react";

type GameResultsModalProps = {
    isOpen: boolean;
    onClose?: () => void;
    payout: number;
    betAmount: number;
    usdMode: boolean;
    apePrice: number;
    isLoading: boolean;
    gameTitle?: string

    onReset: () => void;
    onPlayAgain: () => void;
    onRewatch?: () => void;
    showRewatchOption: boolean;
    showPlayAgainOption: boolean;
    showPNL: boolean;
    resetButtonText?: string;
    playAgainButtonText?: string;
    rewatchButtonText?: string;
};

const GameResultsModal: React.FC<GameResultsModalProps> = ({
    isOpen,
    onClose,
    payout,
    betAmount,
    usdMode,
    apePrice,
    isLoading,
    gameTitle,
    onReset,
    onPlayAgain,
    onRewatch,
    showRewatchOption,
    showPlayAgainOption,
    showPNL,
    resetButtonText = "Change Bet",
    playAgainButtonText = "Play Again",
    rewatchButtonText = "Rewatch",
}) => {
    const [minimizeResultsModal, setMinimizeResultsModal] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

    // Draggable minimized modal state
    const [isDragging, setIsDragging] = useState(false);
    const dragDistance = useRef(0);

    // Handle drag start
    const handleDragStart = useCallback(() => {
        setIsDragging(true);
        dragDistance.current = 0;
    }, []);

    // Handle drag (track distance moved for click detection)
    const handleDrag = useCallback((_: unknown, info: { offset: { x: number; y: number } }) => {
        dragDistance.current = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    }, []);

    // Handle drag end - reset distance so subsequent clicks work
    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        // Small delay to allow click handler to check distance first
        setTimeout(() => {
            dragDistance.current = 0;
        }, 50);
    }, []);

    // Handle click - only expand if drag was minimal (deliberate drags require 20px+ movement)
    const handleClick = useCallback(() => {
        if (dragDistance.current < 20) {
            setMinimizeResultsModal(false);
        }
    }, []);

    // Auto-open and animate in when isOpen becomes true
    // Respect user's minimize preference - don't force it to expand if they want it minimized
    useEffect(() => {
        if (isOpen && !hasAnimatedIn) {
            setHasAnimatedIn(true);
            // Don't force setMinimizeResultsModal(false) - respect the user's preference
            // If they minimized it before, it should stay minimized for subsequent games
        }
    }, [isOpen, hasAnimatedIn]);

    // Reset animation state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setHasAnimatedIn(false);
        }
    }, [isOpen]);

    const isWin = payout > 0;
    const isProfitableWin = payout > betAmount && payout > 1;
    const displayPayout = usdMode
        ? `$${(payout * apePrice).toLocaleString([], {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`
        : `${payout.toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;

    if (!isOpen) return null;

    return (
        <>
            {/* Minimized version - shown in corner when minimized */}
            <AnimatePresence>
                {minimizeResultsModal && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: -50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute top-2 left-2 lg:top-4 lg:left-4 z-20"
                    >
                        <motion.div
                            drag
                            dragSnapToOrigin
                            dragElastic={0.2}
                            dragTransition={{
                                bounceStiffness: 400,
                                bounceDamping: 15,
                            }}
                            onDragStart={handleDragStart}
                            onDrag={handleDrag}
                            onDragEnd={handleDragEnd}
                            onClick={handleClick}
                            whileHover={!isDragging ? { scale: 1.05, rotate: 0 } : undefined}
                            whileTap={!isDragging ? { scale: 0.95 } : undefined}
                            animate={isDragging ? {
                                scale: 1.1,
                                rotate: 0,
                                boxShadow: `0 20px 50px ${isWin ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)"}`,
                            } : {
                                scale: 1,
                                rotate: -2,
                                boxShadow: `0 8px 24px ${isWin ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            style={{ touchAction: "none" }}
                            className={cn(
                                "relative group px-3 py-2 rounded-2xl shadow-2xl border-2 backdrop-blur-sm",
                                isDragging ? "cursor-grabbing" : "cursor-grab",
                                isWin
                                    ? "bg-linear-to-br from-green-500/90 to-emerald-600/90 border-green-400/50"
                                    : "bg-linear-to-br from-red-500/90 to-rose-600/90 border-red-400/50"
                            )}
                        >
                            <div className="flex items-center gap-3 select-none pointer-events-none">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm tracking-wider text-sidebar-foreground">
                                            {isWin ? "Win!" : "Lose"}
                                        </p>
                                        <div
                                            className={cn(
                                                "flex items-center justify-center rounded-full p-1 border text-sidebar-foreground",
                                                isWin
                                                    ? "bg-[#33B77B] border-[#47B88A]"
                                                    : "bg-[#F03E52] border-[#F84054]"
                                            )}
                                        >
                                            <Maximize2 className="w-3 h-3" />
                                        </div>
                                    </div>
                                    {isWin && (
                                        <p className="font-bold text-lg text-primary">
                                            {displayPayout}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Full modal - shown when not minimized */}
            <AnimatePresence>
                {!minimizeResultsModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 z-20 bg-[#12181C]/75 backdrop-blur-xs rounded-[8px]"
                            onClick={onClose || (() => setMinimizeResultsModal(true))}
                        />

                        {/* Modal content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.3, rotate: -15, y: 100 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                rotate: [0, -2, 2, -1, 1, 0],
                                y: 0,
                            }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 10, y: 50 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                mass: 0.5,
                                rotate: {
                                    duration: 0.6,
                                    ease: "easeOut",
                                },
                            }}
                            className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <motion.div
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                    "relative w-full max-w-md pointer-events-auto",
                                    "transform -rotate-1"
                                )}
                            >
                                {/* Sticker-like container */}
                                <motion.div
                                    whileHover={{ scale: 1.02, rotate: 0 }}
                                    className={cn(
                                        "relative rounded-3xl p-6 sm:p-8 border-4",
                                        "bg-linear-to-br backdrop-blur-sm",
                                        isWin
                                            ? "from-green-500/95 to-emerald-600/95 border-green-400/60"
                                            : "from-red-500/95 to-rose-600/95 border-red-400/60"
                                    )}
                                >
                                    {/* Close/Minimize button */}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        {onClose && (
                                            <button
                                                onClick={onClose}
                                                className={`p-1.5 rounded-full transition-colors ${isWin ? "bg-[#33B77B] hover:bg-[#33B77B]/90" : "bg-[#F03E52] hover:bg-[#F03E52]/90"}`}
                                                aria-label="Close"
                                            >
                                                <X className="w-4 h-4 text-sidebar-foreground" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setMinimizeResultsModal(true)}
                                            className={`p-1.5 rounded-full transition-colors ${isWin ? "bg-[#33B77B] hover:bg-[#33B77B]/90" : "bg-[#F03E52] hover:bg-[#F03E52]/90"}`}
                                            aria-label="Minimize"
                                        >
                                            <Minimize2 className="w-4 h-4 text-sidebar-foreground" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col items-center gap-4 pt-4">
                                        {/* Result text */}
                                        <motion.div
                                            initial={{ scale: 0, rotate: -10 }}
                                            animate={{
                                                scale: [0, 1.2, 1],
                                                rotate: [0, 5, -5, 0],
                                            }}
                                            transition={{
                                                delay: 0.2,
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 12,
                                                scale: {
                                                    duration: 0.5,
                                                    times: [0, 0.6, 1],
                                                },
                                                rotate: {
                                                    duration: 0.4,
                                                    delay: 0.3,
                                                },
                                            }}
                                            className="text-center"
                                        >
                                            <h2
                                                className="font-bold text-3xl sm:text-4xl mb-2 tracking-wider text-sidebar-foreground"
                                                style={{
                                                    textShadow: `0 4px 12px ${isWin
                                                        ? "rgba(34, 197, 94, 0.6)"
                                                        : "rgba(239, 68, 68, 0.6)"
                                                        }, 
                                       0 0 20px ${isWin
                                                            ? "rgba(34, 197, 94, 0.4)"
                                                            : "rgba(239, 68, 68, 0.4)"
                                                        }`,
                                                }}
                                            >
                                                {isWin ? "You Won!" : "Try Again!"}
                                            </h2>
                                        </motion.div>

                                        {/* Payout amount */}
                                        {isWin && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -15, y: 20 }}
                                                animate={{
                                                    scale: [0, 1.3, 1],
                                                    rotate: [0, 8, -8, 0],
                                                    y: 0,
                                                }}
                                                transition={{
                                                    delay: 0.4,
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 12,
                                                    scale: {
                                                        duration: 0.5,
                                                        times: [0, 0.7, 1],
                                                    },
                                                    rotate: {
                                                        duration: 0.5,
                                                        delay: 0.5,
                                                    },
                                                }}
                                                className="text-center"
                                            >
                                                <p
                                                    className="font-bold text-4xl sm:text-5xl text-primary"
                                                >
                                                    {displayPayout}
                                                </p>
                                            </motion.div>
                                        )}

                                        {/* Buttons */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            transition={{
                                                delay: 0.6,
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20,
                                            }}
                                            className="w-full flex flex-col gap-3 mt-2"
                                        >
                                            {/* Share PNL button - full width above play again if rewatch is present */}
                                            {/* {showPNL && onRewatch != null && showRewatchOption && gameTitle && (
                                                <PNLCard>
                                            )} */}

                                            {/* Reset and Rewatch/Share PNL row */}
                                            <div className="w-full flex flex-row gap-3">
                                                {/* Reset button - always present */}
                                                <Button
                                                    className={cn(
                                                        onRewatch != null && showRewatchOption
                                                            ? "flex-1"
                                                            : showPNL && (!onRewatch || !showRewatchOption)
                                                                ? "flex-1"
                                                                : "w-full",
                                                        "font-bold py-3 text-lg rounded-xl border text-secondary-border hover:bg-sidebar-foreground/30 hover:border-sidebar-foreground/30",
                                                        `${isWin ? "bg-[#33B77B] border-[#47B88A]" : "bg-[#F03E52] border-[#F84054]"}`
                                                    )}
                                                    onClick={onReset}
                                                    disabled={isLoading}
                                                >
                                                    {resetButtonText}
                                                </Button>

                                                {/* Rewatch button - next to reset if present */}
                                                {onRewatch != null && showRewatchOption && (
                                                    <Button
                                                        className={cn(
                                                            "flex-1 font-bold py-3 text-lg rounded-xl border text-secondary-border hover:bg-sidebar-foreground/30 hover:border-sidebar-foreground/30",
                                                            `${isWin ? "bg-[#33B77B] border-[#47B88A]" : "bg-[#F03E52] border-[#F84054]"}`
                                                        )}
                                                        onClick={onRewatch}
                                                        disabled={isLoading}
                                                    >
                                                        {rewatchButtonText}
                                                    </Button>
                                                )}

                                                {/* Share PNL button - next to reset if rewatch not present */}
                                                {/* {showPNL && (!onRewatch || !showRewatchOption) && gameTitle && (
                                                     <PNLCard>
                                                )} */}
                                            </div>

                                            {/* Play again button - always at bottom, full width */}
                                            {showPlayAgainOption && (
                                                <Button
                                                    className="w-full font-bold py-3 text-lg rounded-xl bg-[#1D282E] border border-[#27353D] text-sidebar-foreground hover:bg-[#2a2e30]"
                                                    onClick={onPlayAgain}
                                                    disabled={isLoading}
                                                >
                                                    {playAgainButtonText}
                                                </Button>
                                            )}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default GameResultsModal;
