export const runtime = "edge";

import { getDb } from "@/lib/db";
import { responses } from "@/lib/schema";
import { NextResponse } from "next/server";

const SLOT_COUNT = 49; // 0 to 720, step 15 → 49 ticks

function minutesToLabel(minutes: number): string {
  const totalMinutes = minutes + 12 * 60;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(responses);

    // For each 15-min slot, count how many responses cover it
    const data = [];
    const userCategories = new Set<string>();

    for (let i = 0; i < SLOT_COUNT; i++) {
      const slotMinutes = i * 15;
      let afternoon = 0;
      let evening = 0;
      let night = 0;

      for (const row of rows) {
        if (slotMinutes >= row.startTime && slotMinutes < row.endTime) {
          if (row.category === "afternoon") afternoon++;
          else if (row.category === "evening") evening++;
          else if (row.category === "night") night++;
        }
        // Track unique users
        if (i === 0) {
          userCategories.add(`${row.userHash}-${row.category}`);
        }
      }

      data.push({
        minutes: slotMinutes,
        label: minutesToLabel(slotMinutes),
        afternoon,
        evening,
        night,
      });
    }

    // Count unique user-category pairs / 3 categories ≈ unique respondents
    const uniqueUsers = new Set(rows.map((r) => r.userHash));

    // Aggregate country stats (one count per unique user, not per row)
    const userCountryMap = new Map<string, string | null>();
    for (const row of rows) {
      if (!userCountryMap.has(row.userHash)) {
        userCountryMap.set(row.userHash, row.country ?? null);
      }
    }
    const countryCounts: Record<string, number> = {};
    for (const country of userCountryMap.values()) {
      const key = country || "Unknown";
      countryCounts[key] = (countryCounts[key] || 0) + 1;
    }
    const countryStats = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      data,
      totalResponses: uniqueUsers.size,
      countryStats,
    });
  } catch (e) {
    console.error("Results error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
