import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/http";
import { getRequestContext } from "@cloudflare/next-on-pages";
import * as schema from "./schema";

function getEnv(key: string): string {
  try {
    const ctx = getRequestContext();
    return (ctx.env as Record<string, string>)[key] ?? "";
  } catch {
    return process.env[key] ?? "";
  }
}

export function getDb() {
  const client = createClient({
    url: getEnv("TURSO_DATABASE_URL"),
    authToken: getEnv("TURSO_AUTH_TOKEN"),
  });
  return drizzle(client, { schema });
}
