"use client";

import { useState, useEffect, useRef } from "react";
import { TimeSlider } from "./TimeSlider";
import { ResultsChart, type ChartDataPoint } from "./ResultsChart";
import { CountryList, type CountryStat } from "./CountryList";
import { CATEGORIES, CATEGORY_CONFIG, type Category } from "@/lib/time";
import { getOrCreateBrowserId } from "@/lib/browser-id";
import { detectCountry } from "@/lib/geolocation";
import { Send, Loader2, BarChart3, RefreshCw } from "lucide-react";

type Ranges = Record<Category, [number, number]>;

const defaultRanges: Ranges = {
  afternoon: [...CATEGORY_CONFIG.afternoon.defaultRange],
  evening: [...CATEGORY_CONFIG.evening.defaultRange],
  night: [...CATEGORY_CONFIG.night.defaultRange],
};

interface ResultsData {
  data: ChartDataPoint[];
  totalResponses: number;
  countryStats: CountryStat[];
}

interface SurveyFormProps {
  initialResults?: ResultsData | null;
}

export function SurveyForm({ initialResults }: SurveyFormProps) {
  const [ranges, setRanges] = useState<Ranges>({ ...defaultRanges });
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const countryRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialResults) {
      setResults(initialResults);
    }
  }, [initialResults]);

  // Detect country on mount (silent — no prompt to user)
  useEffect(() => {
    detectCountry().then((code) => {
      countryRef.current = code;
    });
  }, []);

  const TWO_HOURS = 120;

  const handleChange = (category: Category, value: [number, number]) => {
    setRanges((prev) => {
      const next = { ...prev, [category]: value };

      if (category === "afternoon") {
        const eveningStart = value[1];
        const eveningEnd = Math.min(eveningStart + TWO_HOURS, 720);
        next.evening = [eveningStart, eveningEnd];
        const nightStart = eveningEnd;
        const nightEnd = Math.min(nightStart + TWO_HOURS, 720);
        next.night = [nightStart, nightEnd];
      } else if (category === "evening") {
        const nightStart = value[1];
        const nightEnd = Math.min(nightStart + TWO_HOURS, 720);
        next.night = [nightStart, nightEnd];
      }

      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const browserId = getOrCreateBrowserId();
      const entries = CATEGORIES.map((cat) => ({
        category: cat,
        startTime: ranges[cat][0],
        endTime: ranges[cat][1],
      }));

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ browserId, entries, country: countryRef.current }),
      });

      if (!res.ok) {
        throw new Error("Submission failed. Please try again.");
      }

      const resultsRes = await fetch("/api/results");
      if (!resultsRes.ok) {
        throw new Error("Could not load results.");
      }
      const resultsData: ResultsData = await resultsRes.json();
      setResults(resultsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/results");
      if (res.ok) {
        const data: ResultsData = await res.json();
        setResults(data);
      }
    } finally {
      setRefreshing(false);
    }
  };

  if (results) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            Thanks for your submission! Here&apos;s what everyone thinks.
          </p>
        </div>
        <ResultsChart data={results.data} totalResponses={results.totalResponses} />
        {results.countryStats && results.countryStats.length > 0 && (
          <CountryList stats={results.countryStats} />
        )}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh results"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Drag the handles on each slider to set when you think each
          time period starts and ends.
        </p>
      </div>
      <div className="space-y-6">
        {CATEGORIES.map((cat) => (
          <TimeSlider
            key={cat}
            label={CATEGORY_CONFIG[cat].label}
            color={CATEGORY_CONFIG[cat].color}
            value={ranges[cat]}
            onChange={(v) => handleChange(cat, v)}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white dark:text-gray-900 font-medium rounded-xl transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit &amp; See Results
          </>
        )}
      </button>
    </div>
  );
}
