"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CATEGORY_CONFIG, minutesToLabel } from "@/lib/time";
import { useTheme } from "./ThemeProvider";

export interface ChartDataPoint {
  minutes: number;
  label: string;
  afternoon: number;
  evening: number;
  night: number;
}

interface ResultsChartProps {
  data: ChartDataPoint[];
  totalResponses: number;
}

export function ResultsChart({ data, totalResponses }: ResultsChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          The Consensus Map
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {totalResponses} response{totalResponses !== 1 ? "s" : ""}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradAfternoon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CATEGORY_CONFIG.afternoon.color} stopOpacity={isDark ? 0.5 : 0.4} />
              <stop offset="95%" stopColor={CATEGORY_CONFIG.afternoon.color} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradEvening" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CATEGORY_CONFIG.evening.color} stopOpacity={isDark ? 0.5 : 0.4} />
              <stop offset="95%" stopColor={CATEGORY_CONFIG.evening.color} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradNight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CATEGORY_CONFIG.night.color} stopOpacity={isDark ? 0.5 : 0.4} />
              <stop offset="95%" stopColor={CATEGORY_CONFIG.night.color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f0f0f0"} />
          <XAxis
            dataKey="minutes"
            tickFormatter={(m) => minutesToLabel(m)}
            tick={{ fontSize: 10, fill: isDark ? "#9ca3af" : "#6b7280" }}
            ticks={[0, 90, 180, 270, 360, 450, 540, 630, 720]}
            interval={0}
            stroke={isDark ? "#4b5563" : "#e5e7eb"}
          />
          <YAxis
            tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }}
            allowDecimals={false}
            stroke={isDark ? "#4b5563" : "#e5e7eb"}
          />
          <Tooltip
            labelFormatter={(m) => minutesToLabel(m as number)}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#e5e7eb",
              color: isDark ? "#f3f4f6" : "#1f2937",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: isDark ? "#d1d5db" : undefined }}
          />
          <Area
            type="monotone"
            dataKey="afternoon"
            name="Afternoon"
            stroke={CATEGORY_CONFIG.afternoon.color}
            fill="url(#gradAfternoon)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="evening"
            name="Evening"
            stroke={CATEGORY_CONFIG.evening.color}
            fill="url(#gradEvening)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="night"
            name="Night"
            stroke={CATEGORY_CONFIG.night.color}
            fill="url(#gradNight)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
