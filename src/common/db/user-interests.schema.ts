import { pgTable, uuid, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema.js";

export const userInterestsTable = pgTable("user_interests", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
    interest: varchar("interest", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
    uniqueUserInterest: unique("unique_user_interest").on(t.userId, t.interest),
}));
