"use client";

import * as Slider from "@radix-ui/react-slider";
import { minutesToLabel } from "@/lib/time";

interface TimeSliderProps {
  label: string;
  color: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function TimeSlider({ label, color, value, onChange }: TimeSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
          {minutesToLabel(value[0])} — {minutesToLabel(value[1])}
        </span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
        min={0}
        max={720}
        step={30}
        minStepsBetweenThumbs={1}
      >
        <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-[6px]">
          <Slider.Range
            className="absolute rounded-full h-full"
            style={{ backgroundColor: color }}
          />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-white dark:bg-gray-200 border-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 cursor-grab active:cursor-grabbing"
          style={{ borderColor: color, "--tw-ring-color": color } as React.CSSProperties}
          aria-label={`${label} start time`}
        />
        <Slider.Thumb
          className="block w-5 h-5 bg-white dark:bg-gray-200 border-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 cursor-grab active:cursor-grabbing"
          style={{ borderColor: color, "--tw-ring-color": color } as React.CSSProperties}
          aria-label={`${label} end time`}
        />
      </Slider.Root>
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 px-0.5">
        <span>12 PM</span>
        <span>3 PM</span>
        <span>6 PM</span>
        <span>9 PM</span>
        <span>12 AM</span>
      </div>
    </div>
  );
}
