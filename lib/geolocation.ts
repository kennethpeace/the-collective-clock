/**
 * Detect user's country code via free IP geolocation.
 * Returns ISO 3166-1 alpha-2 code (e.g. "US") or null if unavailable/declined.
 */
export async function detectCountry(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data.country_code ?? null;
  } catch {
    return null;
  }
}
