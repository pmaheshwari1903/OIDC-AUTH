import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema.js";

export const userProfilesTable = pgTable("user_profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull().unique(),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    country: varchar("country", { length: 100 }),
    locale: varchar("locale", { length: 20 }),
    dateOfBirth: timestamp("date_of_birth"),
    gender: varchar("gender", { length: 50 }),
    locationSource: varchar("location_source", { length: 50 }),
    locationPrecision: varchar("location_precision", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
