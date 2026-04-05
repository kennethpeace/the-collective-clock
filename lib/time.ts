/** Convert minutes-from-noon (0–720) to display string like "3:45 PM" */
export function minutesToLabel(minutes: number): string {
  const totalMinutes = minutes + 12 * 60; // offset from midnight
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

/** Generate all 15-min tick labels from 12 PM to 12 AM */
export function generateTimeSlots(): { minutes: number; label: string }[] {
  const slots: { minutes: number; label: string }[] = [];
  for (let m = 0; m <= 720; m += 15) {
    slots.push({ minutes: m, label: minutesToLabel(m) });
  }
  return slots;
}

export const CATEGORIES = ["afternoon", "evening", "night"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; color: string; fillColor: string; defaultRange: [number, number] }
> = {
  afternoon: {
    label: "Afternoon",
    color: "rgb(234, 179, 8)",
    fillColor: "rgba(234, 179, 8, 0.3)",
    defaultRange: [0, 60], // 12 PM – 1 PM
  },
  evening: {
    label: "Evening",
    color: "rgb(249, 115, 22)",
    fillColor: "rgba(249, 115, 22, 0.3)",
    defaultRange: [0, 60], // 12 PM – 1 PM
  },
  night: {
    label: "Night",
    color: "rgb(139, 92, 246)",
    fillColor: "rgba(139, 92, 246, 0.3)",
    defaultRange: [0, 60], // 12 PM – 1 PM
  },
};
