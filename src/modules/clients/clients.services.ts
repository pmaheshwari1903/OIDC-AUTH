import { db, clientsTable } from '../../common/db/index.js'
import { JWK } from '../../common/utils/cert.js'
import crypto, { UUID } from 'node:crypto'
import { generateSecretToken } from "../../common/utils/jwt.utils.js"
import { eq } from 'drizzle-orm'

const createClient = async ({ name, redirectUri }: { name: string; redirectUri: string }) => {
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

const findClientByIdentifier = async (identifier: string) => {
    // 1. Check by public clientId (e.g. 729bfec1-5f91-43ea-badf-528d663631af)
    const [byClientId] = await db.select().from(clientsTable).where(eq(clientsTable.clientId, identifier));
    if (byClientId) return byClientId;

    // 2. If valid UUID, also check by internal database id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
    if (isUuid) {
        const [byId] = await db.select().from(clientsTable).where(eq(clientsTable.id, identifier));
        if (byId) return byId;
    }

    return null;
};

const getClients = async () => {
    const clients = await db.select().from(clientsTable);
    // Never expose clientSecret in client listings
    return clients.map(c => ({
        id: c.id,
        clientId: c.clientId,
        applicationName: c.name,
        name: c.name,
        redirectUri: c.redirectUri,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    }));
};

const getClientById = async (identifier: string, body?: any) => {
    const client = await findClientByIdentifier(identifier);
    if (!client) throw new Error("Client Not Found");
    // Never expose clientSecret
    return {
        id: client.id,
        clientId: client.clientId,
        applicationName: client.name,
        name: client.name,
        redirectUri: client.redirectUri,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
    };
};

const getPublicClientDetails = async (clientId: string) => {
    const client = await findClientByIdentifier(clientId);
    if (!client) throw new Error("Client Not Found");
    return {
        name: client.name,
        applicationName: client.name,
        clientId: client.clientId,
        redirectUri: client.redirectUri,
    };
};

const updateClient = async (
    identifier: string,
    data: { name?: string; applicationName?: string; redirectUri?: string }
) => {
    const existingClient = await findClientByIdentifier(identifier);
    if (!existingClient) throw new Error("Client Not Found");

    // Object for PATCH updates - clientId and clientSecret are NOT modified
    const updateData: {
        name?: string;
        redirectUri?: string;
        updatedAt?: Date;
    } = {
        updatedAt: new Date(),
    };

    const rawName = data.applicationName !== undefined ? data.applicationName : data.name;
    if (rawName !== undefined) updateData.name = rawName.trim();
    if (data.redirectUri !== undefined) updateData.redirectUri = data.redirectUri.trim();

    const [updatedClient] = await db
        .update(clientsTable)
        .set(updateData)
        .where(eq(clientsTable.id, existingClient.id))
        .returning();

    // Return updated client details without exposing clientSecret
    return {
        id: updatedClient.id,
        clientId: updatedClient.clientId,
        applicationName: updatedClient.name,
        name: updatedClient.name,
        redirectUri: updatedClient.redirectUri,
        createdAt: updatedClient.createdAt,
        updatedAt: updatedClient.updatedAt,
    };
};

const deleteClient = async (identifier: string) => {
    const existingClient = await findClientByIdentifier(identifier);
    if (!existingClient) {
        throw new Error("Client Not Found");
    }
    const [deletedClient] = await db
        .delete(clientsTable)
        .where(eq(clientsTable.id, existingClient.id))
        .returning();
    return {
        id: deletedClient.id,
        clientId: deletedClient.clientId,
        name: deletedClient.name,
    };
};

export {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient,
    getPublicClientDetails,
    findClientByIdentifier
};