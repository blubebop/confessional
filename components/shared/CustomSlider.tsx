import React, { useCallback, useMemo } from 'react';

interface CustomSliderProps {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
    presets: number[];
    themeColor: string;
    disabled?: boolean;
    tooltip?: React.JSX.Element | undefined;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
    label,
    min,
    max,
    step,
    value,
    onChange,
    presets,
    themeColor,
    disabled = false,
    tooltip
}) => {

    // Memoized calculation for the slider's fill and handle position
    const getWidthPercentage = useMemo(() => {
        if (max <= min) return 0;
        const displayValue = Math.max(min, value);
        return ((displayValue - min) / (max - min)) * 100;
    }, [value, min, max]);

    // A single handler for any value change, ensuring it's clamped
    const handleValueChange = useCallback((newValue: number) => {
        const clampedValue = Math.max(min, Math.min(max, newValue));
        onChange(clampedValue);
    }, [min, max, onChange]);

    return (
        // Define the theme color as a CSS variable for use within Tailwind classes
        <div className="w-full" style={{ '--theme-color': themeColor } as React.CSSProperties}>
            {/* Top row: Label and Value Display */}
            <div className="flex items-center justify-between gap-2">
                {tooltip ? (
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <p className="text-sm font-medium text-gray-400">{label}</p>
                        {tooltip}
                    </div>
                ) : (
                    <p className="text-sm font-medium text-gray-400">{label}</p>
                )}
                <p className="font-semibold text-lg" style={{ color: themeColor }}>
                    {value}
                </p>
            </div>

            {/* Middle row: Slider */}
            <div className="mt-1 flex items-center">
                {/* Interactive Slider */}
                <div className="relative h-8 w-full bg-gray-900/70 border border-(--theme-color)/30 rounded-[5px] overflow-hidden">
                    <div className="absolute inset-0 flex items-center px-3">
                        <div className="w-full h-4 bg-gray-800 rounded-[4px]"></div>
                    </div>
                    <div
                        className="absolute inset-y-0 left-3 flex items-center"
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
            </div>

            {/* Bottom row: Preset value buttons */}
            <div className="mt-3 grid grid-cols-3 gap-2 md:hidden">
                {presets.map((presetValue) => (
                    <button
                        key={presetValue}
                        onClick={() => handleValueChange(presetValue)}
                        disabled={disabled}
                        className={`text-xs font-semibold py-1.5 rounded-[5px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${value === presetValue
                            ? 'bg-(--theme-color)/80 text-white shadow-md'
                            : 'bg-gray-700/20 text-gray-300 border border-(--theme-color)/30 hover:bg-(--theme-color)/40'
                            }`}
                    >
                        {presetValue}
                    </button>
                ))}
            </div>
        </div>
    );
};