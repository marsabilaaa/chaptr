import { pgTable, uuid, text, timestamp, json } from "drizzle-orm/pg-core";

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  themeId: text("theme_id").default("default").notNull(),
  customTheme: json("custom_theme"),
  mode: text("mode").default("system").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
