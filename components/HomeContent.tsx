"use client";

import { useState, useRef, useCallback } from "react";
import { SurveyForm } from "./SurveyForm";
import { Clock } from "lucide-react";

interface ResultsData {
  data: Array<{
    minutes: number;
    label: string;
    afternoon: number;
    evening: number;
    night: number;
  }>;
  totalResponses: number;
  countryStats: Array<{ country: string; count: number }>;
}

export function HomeContent() {
  const [secretResults, setSecretResults] = useState<ResultsData | null>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleClockClick = useCallback(async () => {
    clickCountRef.current += 1;

    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 3000);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      try {
        const res = await fetch("/api/results");
        if (res.ok) {
          const data: ResultsData = await res.json();
          setSecretResults(data);
        }
      } catch {
        // silently fail
      }
    }
  }, []);

  return (
    <div className="w-full max-w-lg space-y-8 bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="text-center space-y-3">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 cursor-pointer select-none"
          onClick={handleClockClick}
        >
          <Clock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          The Collective Clock
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
          Let&apos;s settle the &ldquo;Evening&rdquo; debate! 🕒 When does
          afternoon end and evening begin? What about night? Help us map
          the collective &ldquo;inner clock&rdquo;&mdash;instantly unlock
          the <strong>Consensus Map</strong> upon submission!
        </p>
      </div>

      {/* Survey */}
      <SurveyForm initialResults={secretResults} />

      {/* Footer */}
      <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center pb-4">
        Your IP is hashed for deduplication only&mdash;no personal data
        is stored.
      </p>
    </div>
  );
}
