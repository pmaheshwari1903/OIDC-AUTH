import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const clientsTable = pgTable("clients",{
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", {length: 100}).notNull(),

    clientId: varchar("client_id", {length: 255}).notNull().unique(),

    clientSecret: text("client_secret").notNull(),

    redirectUri: text("redirect_uri").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
})