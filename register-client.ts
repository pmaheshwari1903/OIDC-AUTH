import 'dotenv/config';
import { db, clientsTable } from './src/common/db/index.js';
import crypto from 'node:crypto';
import { generateSecretToken } from "./src/common/utils/jwt.utils.js";

async function main() {
    const name = "SRMPREPHUB";
    const redirectUri = "http://localhost:5173/auth/callback";
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
