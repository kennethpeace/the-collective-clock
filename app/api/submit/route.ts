export const runtime = "edge";

import { getDb } from "@/lib/db";
import { responses } from "@/lib/schema";
import { hashIP } from "@/lib/hash";
import { NextRequest, NextResponse } from "next/server";

const VALID_CATEGORIES = ["afternoon", "evening", "night"] as const;

interface SubmitEntry {
  category: string;
  startTime: number;
  endTime: number;
}

interface SubmitBody {
  browserId?: string;
  entries: SubmitEntry[];
  country?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    let salt = "default-salt";
    try {
      const { env } = getRequestContext();
      salt = (env as Record<string, string>).IP_HASH_SALT ?? salt;
    } catch {
      salt = process.env.IP_HASH_SALT ?? salt;
    }
    const body: SubmitBody = await request.json();

    // Support both new format { browserId, entries } and legacy array format
    const entries = Array.isArray(body) ? body as unknown as SubmitEntry[] : body.entries;
    const browserId = Array.isArray(body) ? undefined : body.browserId;
    const country = Array.isArray(body) ? null : (body.country || null);

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Prefer browser fingerprint; fall back to IP hash
    let userHash: string;
    if (browserId) {
      userHash = await hashIP(browserId, salt);
    } else {
      const ip =
        request.headers.get("cf-connecting-ip") ??
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      userHash = await hashIP(ip, salt);
    }

    const db = getDb();

    for (const entry of entries) {
      if (!VALID_CATEGORIES.includes(entry.category as typeof VALID_CATEGORIES[number])) {
        continue;
      }

      const startTime = Math.max(0, Math.min(720, Math.round(entry.startTime / 30) * 30));
      const endTime = Math.max(0, Math.min(720, Math.round(entry.endTime / 30) * 30));

      if (startTime >= endTime) continue;

      await db
        .insert(responses)
        .values({
          userHash,
          category: entry.category as typeof VALID_CATEGORIES[number],
          startTime,
          endTime,
          country,
        })
        .onConflictDoUpdate({
          target: [responses.userHash, responses.category],
          set: {
            startTime,
            endTime,
            country,
            createdAt: new Date().toISOString(),
          },
        });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Submit error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
