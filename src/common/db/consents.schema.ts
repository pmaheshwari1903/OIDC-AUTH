import { pgTable, uuid, timestamp, pgEnum, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema.js";
import { clientsTable } from "./clients.schema.js";

export const consentStatusEnum = pgEnum("consent_status", ["granted", "revoked", "expired"]);
export const consentPurposeEnum = pgEnum("consent_purpose", [
    "authentication",
    "personalization",
    "recommendations",
    "analytics",
    "marketing",
    "advertising"
]);

export const consentsTable = pgTable("consents", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
    clientId: uuid("client_id").references(() => clientsTable.id, { onDelete: "cascade" }).notNull(),
    scope: varchar("scope", { length: 255 }).notNull(),
    purpose: consentPurposeEnum("purpose").notNull(),
    status: consentStatusEnum("status").default("granted").notNull(),
    grantedAt: timestamp("granted_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
