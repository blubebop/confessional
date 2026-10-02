"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import useSound from 'use-sound';
import { Game } from "@/lib/games";

interface MyGameWindowProps {
    game: Game;
    isSpinning: boolean;
    currentSpinIndex: number;
    gameCompleted: boolean;
    spinResults: number[][];
    betAmount: number;
    payoutAmount: number;
}

const MyGameWindow: React.FC<MyGameWindowProps> = ({
    game,
    isSpinning,
    currentSpinIndex,
    gameCompleted,
    spinResults,
    betAmount,
    payoutAmount,
}) => {
    // TODO: get muteSfx, sfxVolume, muteMusic from useUserPreferences
    const muteSfx = false;
    const sfxVolume = 0.5;

    // SFX
    // The hook automatically keeps the volume and mute state synchronized.
    const [winSFX] = useSound('/my-game/sfx/win.mp3', {
        volume: sfxVolume,
        soundEnabled: !muteSfx,
        interrupt: true // Allows the sound to restart if triggered again rapidly
    });
    const [loseSFX] = useSound('/my-game/sfx/lose.mp3', {
        volume: sfxVolume,
        soundEnabled: !muteSfx,
        interrupt: true // Allows the sound to restart if triggered again rapidly
    });


    // PAYOUT STATE
    const [payoutPopupImage, setPayoutPopupImage] = useState<string | null>(null); // Image for the popup
    const [payoutMessageText, setPayoutMessageText] = useState<string | null>(
        null
    ); // For the small text message
    const [payoutPopupText, setPayoutPopupText] = useState<string | null>(null);
    const [payoutPopupSubText, setPayoutPopupSubText] = useState<string | null>(
        null
    );
    const [payoutPopupPriceText, setPayoutPopupPriceText] = useState<
        string | null
    >(null);
    const [showPayoutPopup, setShowPayoutPopup] = useState(false);


    // simulate spin
    useEffect(() => {
        if (
            isSpinning == true &&
            spinResults.length > 0 &&
            currentSpinIndex < spinResults.length
        ) {
            setTimeout(() => {
                // TODO: simulate spin
                const spinOutcome = [
                    Math.floor(Math.random() * 6),
                    Math.floor(Math.random() * 6),
                    Math.floor(Math.random() * 6)
                ];
                setPayoutMessageText("You Won!");
                setPayoutPopupImage("/images/payout/win.png");
                setPayoutPopupText("You Won!");
                setPayoutPopupSubText("You Won!");
                setPayoutPopupPriceText("You Won!");
                setShowPayoutPopup(true);
            }, 1000);
        }
    }, [isSpinning, currentSpinIndex]);

    // simulate game completion
    useEffect(() => {
        if (gameCompleted) {
            const totalBet = betAmount * spinResults.length;

            if (totalBet <= 0) {
                console.warn("Total bet is zero or negative, cannot calculate payout.");
                return;
            }

            const multiplier = payoutAmount / totalBet;

            if (multiplier >= 1) {
                // play win sound
                winSFX();
            } else {
                // play lose sound
                loseSFX();
            }
        }
    }, [gameCompleted]);

    return (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-white">
            {/* Could put payout popup here */}
            {/* ... */}

            {/* Game Frame and Background - currently implemented in the GameWindow component. Remove there if needed. */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                {/* Contained Background - note that this is currently implemented in the GameWindow component */}
                {/* {game.gameBackground && (
                    <div className="absolute inset-[14%] translate-y-[5%] z-1">
                        <Image
                            src={game.gameBackground}
                            alt="Slot Background"
                            fill
                            className="object-cover rounded-md"
                        />
                    </div>
                )} */}

                {/* Frame Overlay if needed */}
                {/* <div className="absolute inset-0 z-20 pointer-events-none">
                    <Image
                        src={game.frameImage}
                        alt="Game Frame"
                        fill
                        className="object-contain"
                    />
                </div> */}

                {/* Game Content */}
                <div
                    // ref={gameContentRef} // ref - if needed
                    className="absolute inset-x-[21%] inset-y-[20%] mt-4 xs:mt-6 sm:mt-8 z-10 flex justify-around gap-1 sm:gap-2 lg:gap-1 aspect-square"
                >
                    Content Here...
                </div>
            </div>
        </div>
    );
};

export default MyGameWindow;
