import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "./schema";

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}
