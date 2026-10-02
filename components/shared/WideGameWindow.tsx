"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Howl } from "howler";
import { Volume2, VolumeX, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameResultsModal from "./GameResultsModal";
import { Game } from "@/lib/games";

type WideGameWindowProps = {
    game: Game;
    isLoading: boolean;
    isGameFinished: boolean;
    children: React.ReactNode;

    betAmount: number | null;
    payout: number | null;
    inReplayMode: boolean;
    isUserOriginalPlayer: boolean;
    showPNL: boolean;
    isGamePaused?: boolean;

    onReset: () => void;
    onPlayAgain?: () => void;
    playAgainText?: string;
    onRewatch?: () => void;
    currentGameId: bigint;

    /** When true, the game component paints its own background art. */
    skipDefaultBackground?: boolean;
    /** Rendered inside a GameHud stage: release the fixed 4:3 aspect and the
     *  window's own frame so it fills the stage. lg+ only. See docs/GAME-HUD.md. */
    hudMode?: boolean;
    hideAudioControls?: boolean;
    disableBuiltInSong?: boolean;
    onMusicMutedChange?: (muted: boolean) => void;
    onSfxMutedChange?: (muted: boolean) => void;
    resultModalDelayMs?: number;
};

const fallbackSong = "/shared/audio/song.mp3";

const WideGameWindow: React.FC<WideGameWindowProps> = ({
    game,
    isLoading,
    isGameFinished,
    children,
    betAmount,
    payout,
    inReplayMode = true,
    isUserOriginalPlayer = false,
    showPNL = false,
    isGamePaused = false,
    onReset,
    onPlayAgain,
    playAgainText = "Play Again",
    onRewatch,
    currentGameId,
    skipDefaultBackground = false,
    hudMode = false,
    hideAudioControls = false,
    disableBuiltInSong = false,
    onMusicMutedChange,
    onSfxMutedChange,
    resultModalDelayMs = 0,
}) => {
    const audioRef = useRef<Howl | null>(null);
    const [muteMusic, setMuteMusic] = useState(false);
    const [muteSfx, setMuteSfx] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (disableBuiltInSong) return;

        const sound = new Howl({
            src: [game.song || fallbackSong],
            loop: true,
            volume: 0.5,
            mute: muteMusic,
        });

        audioRef.current = sound;

        if (!muteMusic) {
            sound.play();
        }

        return () => {
            sound.unload();
            audioRef.current = null;
        };
    }, [game.song, disableBuiltInSong]);

    useEffect(() => {
        if (disableBuiltInSong) return;
        const audio = audioRef.current;
        if (!audio) return;

        audio.mute(muteMusic);
        if (!muteMusic && !audio.playing()) {
            audio.play();
        }
    }, [muteMusic, disableBuiltInSong]);

    useEffect(() => {
        onMusicMutedChange?.(muteMusic);
    }, [muteMusic, onMusicMutedChange]);

    useEffect(() => {
        onSfxMutedChange?.(muteSfx);
    }, [muteSfx, onSfxMutedChange]);

    useEffect(() => {
        if (isGameFinished && resultModalDelayMs > 0) {
            const id = window.setTimeout(() => setShowResults(true), resultModalDelayMs);
            return () => window.clearTimeout(id);
        }
        setShowResults(isGameFinished);
    }, [isGameFinished, resultModalDelayMs]);

    useEffect(() => {
        if (!isGameFinished) {
            setShowResults(false);
        }
    }, [isGameFinished]);

    return (
        <div
            className={cn(
                "w-full rounded-[12px] border-[2.25px] sm:border-[3.75px] lg:border-[4.68px] border-[#2A3640] relative overflow-hidden",
                "aspect-4/3 min-h-0",
                // Inside a GameHud stage the frame/height/aspect come from the HUD.
                hudMode && "lg:h-full lg:aspect-auto lg:border-0 lg:rounded-none",
            )}
        >
            {isGamePaused && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-[#12181C]/75 backdrop-blur-xs rounded-[8px] font-roboto p-4">
                    <h2 className="font-semibold text-xl sm:text-3xl text-center">
                        Game Paused
                    </h2>
                    <p className="text-sm text-muted-foreground text-center max-w-sm sm:max-w-md mx-auto">
                        The game contract is currently paused for maintenance or updates.
                        Please check back later.
                    </p>
                </div>
            )}

            {isLoading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-[#12181C]/75 text-white backdrop-blur-xs rounded-[8px] font-roboto">
                    Loading...
                </div>
            )}

            {showResults &&
                betAmount !== null &&
                payout !== null &&
                onReset &&
                onPlayAgain && (
                    <GameResultsModal
                        key={currentGameId.toString()}
                        isOpen={showResults}
                        payout={payout}
                        betAmount={betAmount}
                        usdMode={false}
                        apePrice={1}
                        isLoading={isLoading}
                        gameTitle={game.title}
                        onReset={onReset}
                        onPlayAgain={onPlayAgain}
                        playAgainButtonText={playAgainText}
                        onRewatch={onRewatch}
                        showPlayAgainOption={!inReplayMode && isUserOriginalPlayer}
                        showRewatchOption={inReplayMode || isUserOriginalPlayer}
                        showPNL={showPNL}
                    />
                )}

            {!skipDefaultBackground &&
                (game.animatedBackground && game.animatedBackground !== "" ? (
                    <video
                        src={game.animatedBackground}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls={false}
                        disablePictureInPicture={true}
                        className="absolute inset-0 w-full h-full object-cover rounded-[8px] pointer-events-none"
                    />
                ) : (
                    <Image
                        src={game.gameBackground}
                        alt="Game Background"
                        fill
                        className="object-cover rounded-[8px] opacity-75"
                        priority
                    />
                ))}

            {children}

            {!hideAudioControls && (
                <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="p-2 bg-[#151C21]/40 rounded-[8px] text-[#91989C]"
                        onClick={() => setMuteSfx((prev) => !prev)}
                        title={muteSfx ? "Unmute SFX" : "Mute SFX"}
                    >
                        {muteSfx ? (
                            <AudioLines className="w-5 h-5 opacity-40" />
                        ) : (
                            <AudioLines className="w-5 h-5" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="p-2 bg-[#151C21]/40 rounded-[8px] text-[#91989C]"
                        onClick={() => setMuteMusic((prev) => !prev)}
                        title={muteMusic ? "Unmute music" : "Mute music"}
                    >
                        {muteMusic ? (
                            <VolumeX className="w-6 h-6" />
                        ) : (
                            <Volume2 className="w-6 h-6" />
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default WideGameWindow;
