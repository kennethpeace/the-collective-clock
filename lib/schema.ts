import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const responses = sqliteTable(
  "responses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userHash: text("user_hash").notNull(),
    category: text("category", {
      enum: ["afternoon", "evening", "night"],
    }).notNull(),
    startTime: integer("start_time").notNull(), // minutes from noon (0–720)
    endTime: integer("end_time").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("unique_submission").on(
      table.userHash,
      table.category
    ),
  ]
);

export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;
