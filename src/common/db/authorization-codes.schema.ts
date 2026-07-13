import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import {clientsTable} from "./clients.schema.js"
import {usersTable} from "./user.schema.js"

export const authorizationCodesTable = pgTable("authorization-codes",{
    id: uuid("id").primaryKey().defaultRandom(),

    code: text("code").notNull().unique(),

    clientId: uuid("client_id").references(() => clientsTable.id).notNull(),

    userId: uuid("user_id").references(() => usersTable.id).notNull(),

    redirectUri: text("redirect_uri").notNull(),

    scope: text("scope").notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    used: boolean("used").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
})