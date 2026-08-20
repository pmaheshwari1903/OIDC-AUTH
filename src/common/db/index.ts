import 'dotenv/config';
import {drizzle, type NodePgDatabase} from "drizzle-orm/node-postgres"

export const db: NodePgDatabase = drizzle(process.env.DATABASE_URL!)

export * from "./user.schema.js"
export * from "./clients.schema.js"
export * from "./authorization-codes.schema.js"
export * from "./user-profiles.schema.js"
export * from "./user-interests.schema.js"
export * from "./consents.schema.js"
export * from "./data-access-logs.schema.js"