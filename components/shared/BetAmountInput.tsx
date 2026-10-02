'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { CircleDollarSign, Wallet } from 'lucide-react';

interface CompactAmountInputProps {
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
    balance: number;
    disabled: boolean;
    usdMode: boolean;
    setUsdMode: (mode: boolean) => void;
    themeColorBackground: string;
}

export const BetAmountInput: React.FC<CompactAmountInputProps> = ({
    min,
    max,
    step,
    value,
    onChange,
    balance,
    disabled,
    usdMode,
    setUsdMode,
    themeColorBackground
}) => {

    const [inputValue, setInputValue] = useState(String(value));

    const handleValueChange = useCallback((newValue: number) => {
        if (disabled) {
            return;
        }
        const clampedValue = Math.max(min, Math.min(max, newValue));
        const roundedValue = parseFloat(clampedValue.toFixed(5));
        setInputValue(String(roundedValue));
        onChange(roundedValue);
    }, [min, max, onChange, disabled]);

    useEffect(() => {
        if (parseFloat(inputValue) !== value) {
            setInputValue(String(value));
        }
    }, [value]);

    useEffect(() => {
        if (disabled) {
            return;
        }
        // If the maximum value allowed changes and is now less than the current bet,
        // clamp the bet amount to the new maximum. This handles cases like switching
        // from a higher value currency (APE) to a lower one (USD).
        if (value > max) {
            handleValueChange(max);
        }
    }, [max, value, handleValueChange, disabled]);

    const getWidthPercentage = useMemo(() => {
        if (disabled) {
            return 0;
        }
        if (max <= min) return 0;
        const displayValue = Math.max(min, value);
        return ((displayValue - min) / (max - min)) * 100;
    }, [value, min, max, disabled]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        let numericValue = parseFloat(inputValue);
        if (isNaN(numericValue)) {
            numericValue = min;
        }
        handleValueChange(numericValue);
    };

    const handleQuickAdd = (amount: number) => {
        handleValueChange(value + amount);
    };

    return (
        // Define the theme color as a CSS variable for use within Tailwind classes
        <div className="w-full space-y-2" style={{ '--theme-color': themeColorBackground } as React.CSSProperties}>
            {/* Top row: "Bet Amount" label and Balance display */}
            <div className="flex items-center justify-between gap-2 text-sm font-medium text-gray-400">
                <p>Bet Amount</p>
                <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setUsdMode(!usdMode)}>
                    <Wallet size={16} />
                    <p className="font-semibold text-gray-300">
                        {disabled ? "Loading..." : usdMode ? `$${balance.toFixed(2)}` : `${balance.toFixed(2)} APE`}
                    </p>
                </div>
            </div>

            {/* Main input field */}
            <div className="flex items-center gap-2 bg-gray-900/70 rounded-[8px] px-3 py-2.5">
                {usdMode ? (
                    <CircleDollarSign
                        size={20}
                        color={themeColorBackground} // Direct prop assignment works well here
                        className="shrink-0 cursor-pointer"
                        onClick={() => setUsdMode(false)}
                    />
                ) : (
                    <Image
                        src="/shared/ape_coin.png"
                        alt="Ape Coin Icon"
                        width={20}
                        height={20}
                        onClick={() => setUsdMode(true)}
                        className="cursor-pointer shrink-0"
                    />
                )}
                <input
                    type="number"
                    placeholder="0.0"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="w-full bg-transparent p-0 border-0 focus:ring-0 focus:outline-none font-medium text-white no-spinner"
                    disabled={disabled}
                />
            </div>

            {/* Interactive Slider */}
            <div className="relative h-8 bg-gray-900/70 border border-(--theme-color)/30 rounded-[5px] overflow-hidden">
                <div className="absolute inset-0 flex items-center px-2">
                    <div className="w-full h-3 bg-gray-800 rounded-[4px]"></div>
                </div>
                <div
                    className="absolute inset-y-0 left-2 flex items-center"
                    style={{
                        // This calculation determines the width of the fill based on the track's actual size (container width minus 1.5rem for px-3)
                        width: `calc((${getWidthPercentage}/100) * (100% - 1.5rem))`,
                        transition: 'width 0.2s ease-out'
                    }}
                >
                    <div className="w-full h-3 bg-(--theme-color)/70"></div>
                </div>
                <div
                    className="absolute top-0 bottom-0 flex items-center"
                    style={{
                        // This calculation positions the handle correctly along the track, accounting for padding and centering the handle
                        left: `calc(0.75rem + ((${getWidthPercentage}/100) * (100% - 1.5rem)) - 8px)`,
                        transition: 'left 0.2s ease-out'
                    }}
                >
                    <div className="w-4 h-5 bg-white rounded-[6px] border-2 border-(--theme-color) shadow-[0_0_8px_var(--theme-color)] cursor-pointer"></div>
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => handleValueChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={disabled}
                />
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 50].map((amount) => (
                    <button
                        key={amount}
                        onClick={() => handleQuickAdd(amount)}
                        disabled={disabled || value + amount > max}
                        className="text-xs font-semibold text-white py-1.5 bg-gray-700/20 border border-(--theme-color)/30 hover:bg-(--theme-color)/40 hover:border-(--theme-color)/60 rounded-[5px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        +{amount}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BetAmountInput;