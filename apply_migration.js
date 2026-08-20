import "dotenv/config";
import pg from "pg";
import fs from "fs";

async function run() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const sql = fs
    .readFileSync(
      "drizzle/0001_panoramic_joshua_kane.sql",
      "utf-8"
    )
    .split("--> statement-breakpoint")
    .join(";");

  await client.query(sql);
  await client.end();

  console.log("Migration applied manually");
}

run().catch(console.error);