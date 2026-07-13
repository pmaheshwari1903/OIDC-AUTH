import { db, clientsTable } from '../../common/db/index.js'
import { JWK } from '../../common/utils/cert.js'
import crypto, { UUID } from 'node:crypto'
import { generateSecretToken } from "../../common/utils/jwt.utils.js"
import { eq } from 'drizzle-orm'

const createClient = async ({ name, redirectUri }: { name?: string; redirectUri?: string }) => {
    if (!name?.trim()) {
        throw new Error("Client name is required");
    }

    if (name.trim().length < 3) {
        throw new Error("Client name must be at least 3 characters long");
    }

    // Validate redirect URI
    if (!redirectUri?.trim()) {
        throw new Error("Redirect URI is required");
    }

    try {
        const url = new URL(redirectUri);

        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error();
        }
    } catch {
        throw new Error("Invalid Redirect URI");
    }

    // Generate credentials
    const clientId = crypto.randomUUID();
    const { rawToken, hashedToken } = generateSecretToken();

    // Save client
    const [client] = await db
        .insert(clientsTable)
        .values({
            name: name.trim(),
            clientId,
            clientSecret: hashedToken,
            redirectUri: redirectUri.trim(),
        })
        .returning();

    // Return credentials
    return {
        clientId: client.clientId,
        clientSecret: rawToken, // Returned only once
    };
}

const getClients = async () => {
    const clients = await db.select().from(clientsTable)
    return clients
}

const getClientById = async (id: string, body: any) => {
    const [clients] = await db.select().from(clientsTable).where(eq(clientsTable.id, id))
    if (!clients) throw new Error("Client Not Found")
    return clients
}

const updateClient = async (id: string, { name, redirectUri }: { name?: string; redirectUri?: string }) => {
    const [existingClient] = await db.select().from(clientsTable).where(eq(clientsTable.id, id))
    if (!existingClient) throw new Error("Client not Found")

    // Object for PATCH updates
    const updateData: {
        name?: string;
        redirectUri?: string;
    } = {};


    if (name !== undefined) {
        if (!name.trim()) {
            throw new Error("Client name is required");
        }

        if (name.trim().length < 3) {
            throw new Error(
                "Client name must be at least 3 characters long"
            );
        }

        updateData.name = name.trim();
    }

    // Validate redirect URI
    if (redirectUri !== undefined) {
        try {
            const url = new URL(redirectUri);

            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error();
            }

            updateData.redirectUri = redirectUri.trim();
        } catch {
            throw new Error("Invalid Redirect URI");
        }
    }

    if (Object.keys(updateData).length === 0) {
        throw new Error("No fields provided for update");
    }

    const updatedClient = await db.update(clientsTable).set(updateData).where(eq(clientsTable.id, id)).returning()

    return updatedClient
}

const deleteClient = async (id: string) => {
    const [existingClient] = await db.select().from(clientsTable).where(eq(clientsTable.id, id))
    if (!existingClient) {
        throw new Error("Client not found")
    }
    const deletedClient = await db.delete(clientsTable).where(eq(clientsTable.id, id)).returning()
    return deletedClient
}


export {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient
}