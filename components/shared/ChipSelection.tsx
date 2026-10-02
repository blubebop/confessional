"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export interface Chip {
  id: string;
  value: number;
  image: string;
}

interface ChipSelectionProps {
  chips: Chip[];
  selectedChipId: string | null;
  onChipSelect: (chip: Chip) => void;
  onRemoveAllBets: () => void;
}

export const ChipSelection: React.FC<ChipSelectionProps> = ({
  chips,
  selectedChipId,
  onChipSelect,
  onRemoveAllBets,
}) => {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="mt-8">
      {/* chip container */}
      <div className="mt-1 bg-input px-2 py-2.5 rounded-[12px] flex justify-evenly items-center gap-2">
        {chips.map((chip, index) => {
          const isSelected = selectedChipId === chip.id;

          return (
            <button
              key={chip.id}
              type="button"
              className={`cursor-pointer transition-all ease-out duration-200 ${
                isSelected ? "-mt-16" : ""
              }`}
              disabled={isSelected}
              onClick={() => onChipSelect(chip)}
            >
              <Image
                src={chip.image}
                alt={`Chip ${index + 1}`}
                width={52}
                height={52}
                className="w-[44px] h-auto sm:w-[52px]"
              />
            </button>
          );
        })}
      </div>

      {/* remove all bets button */}
      <Button
        type="button"
        variant="secondary"
        className="mt-4 w-full bg-input rounded-[8px] border-[#2A3640]"
        onClick={onRemoveAllBets}
      >
        Remove All Bets
      </Button>
    </div>
  );
};

export default ChipSelection;

