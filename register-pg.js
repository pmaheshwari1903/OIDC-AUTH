import 'dotenv/config';
import pg from 'pg';
import crypto from 'crypto';

const { Client } = pg;

async function registerClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();

    const name = "SRMPREPHUB";
    const redirectUri = "http://localhost:5173/auth/callback";
    const clientId = crypto.randomUUID();
    
    const rawToken = crypto.randomBytes(16).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const query = `
      INSERT INTO "clients" (id, name, client_id, client_secret, redirect_uri, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `;
    const values = [crypto.randomUUID(), name, clientId, hashedToken, redirectUri];
    
    await client.query(query, values);

    console.log(`CLIENT_ID=${clientId}`);
    console.log(`CLIENT_SECRET=${rawToken}`);

  } catch (err) {
    console.error('Error inserting client:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

registerClient();
