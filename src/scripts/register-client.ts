import 'dotenv/config';
import { db, clientsTable } from '../common/db/index.js';
import crypto from 'node:crypto';
import { generateSecretToken } from "../common/utils/jwt.utils.js";

async function main() {
    const name = process.argv[2];
    const redirectUri = process.argv[3];

    if (!name || !redirectUri) {
        console.error("Usage: node dist/scripts/register-client.js <name> <redirectUri>");
        console.error("Example: node dist/scripts/register-client.js MyApp http://localhost:3000/auth/callback");
        process.exit(1);
    }

    const clientId = crypto.randomUUID();
    const { rawToken, hashedToken } = generateSecretToken();

    try {
        await db.insert(clientsTable).values({
            name,
            clientId,
            clientSecret: hashedToken,
            redirectUri,
        });

        console.log("Client Registered Successfully!");
        console.log("--------------------------------------------------");
        console.log(`CLIENT_ID=${clientId}`);
        console.log(`CLIENT_SECRET=${rawToken}`);
        console.log("--------------------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("Error creating client:", error);
        process.exit(1);
    }
}

main();
