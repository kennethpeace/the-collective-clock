"use client";

import { Globe } from "lucide-react";

export interface CountryStat {
  country: string; // ISO alpha-2 code or "Unknown"
  count: number;
}

// Map of common country codes to display names
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  DE: "Germany", FR: "France", JP: "Japan", KR: "South Korea",
  IN: "India", BR: "Brazil", MX: "Mexico", IT: "Italy", ES: "Spain",
  NL: "Netherlands", SE: "Sweden", NO: "Norway", DK: "Denmark",
  FI: "Finland", PL: "Poland", PT: "Portugal", CH: "Switzerland",
  AT: "Austria", BE: "Belgium", IE: "Ireland", NZ: "New Zealand",
  SG: "Singapore", HK: "Hong Kong", TW: "Taiwan", PH: "Philippines",
  TH: "Thailand", MY: "Malaysia", ID: "Indonesia", VN: "Vietnam",
  AR: "Argentina", CL: "Chile", CO: "Colombia", RU: "Russia",
  UA: "Ukraine", TR: "Turkey", ZA: "South Africa", EG: "Egypt",
  NG: "Nigeria", KE: "Kenya", IL: "Israel", AE: "UAE",
  SA: "Saudi Arabia", CZ: "Czech Republic", RO: "Romania", HU: "Hungary",
  GR: "Greece", HR: "Croatia", RS: "Serbia", BG: "Bulgaria",
  Unknown: "Unknown",
};

function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

function getFlagUrl(code: string): string | null {
  if (code === "Unknown") return null;
  return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
}

interface CountryListProps {
  stats: CountryStat[];
}

export function CountryList({ stats }: CountryListProps) {
  if (stats.length === 0) return null;

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Responses by Country
        </h3>
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {stats.map(({ country, count }) => {
          const flagUrl = getFlagUrl(country);
          const pct = ((count / total) * 100).toFixed(1);
          return (
            <div
              key={country}
              className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/60"
            >
              {flagUrl ? (
                <img
                  src={flagUrl}
                  alt={`${country} flag`}
                  width={24}
                  height={18}
                  className="rounded-[2px] shrink-0"
                  loading="lazy"
                />
              ) : (
                <span className="w-6 h-[18px] flex items-center justify-center text-xs text-gray-400 shrink-0">
                  🌐
                </span>
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                {getCountryName(country)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                {count}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 w-10 text-right tabular-nums">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
