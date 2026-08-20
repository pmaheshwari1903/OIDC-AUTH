import { pgTable, uuid, timestamp, varchar, text, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema.js";
import { clientsTable } from "./clients.schema.js";

export const dataAccessLogsTable = pgTable("data_access_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
    clientId: uuid("client_id").references(() => clientsTable.id, { onDelete: "cascade" }).notNull(),
    endpoint: varchar("endpoint", { length: 255 }).notNull(),
    requestedScopes: text("requested_scopes").notNull(),
    grantedScopes: text("granted_scopes").notNull(),
    purpose: varchar("purpose", { length: 255 }).notNull(),
    success: boolean("success").notNull(),
    denialReason: text("denial_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull()
});
