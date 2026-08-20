import { db, consentsTable, clientsTable } from '../../common/db/index.js'
import { eq, and } from 'drizzle-orm'

export const getUserConsents = async (userId: string) => {
    const consents = await db.select({
        id: consentsTable.id,
        clientId: consentsTable.clientId,
        clientName: clientsTable.name,
        scope: consentsTable.scope,
        purpose: consentsTable.purpose,
        status: consentsTable.status,
        grantedAt: consentsTable.grantedAt,
        revokedAt: consentsTable.revokedAt,
        expiresAt: consentsTable.expiresAt
    })
    .from(consentsTable)
    .innerJoin(clientsTable, eq(consentsTable.clientId, clientsTable.id))
    .where(eq(consentsTable.userId, userId));

    return consents;
};

export const getConsentById = async (userId: string, consentId: string) => {
    const [consent] = await db.select({
        id: consentsTable.id,
        clientId: consentsTable.clientId,
        clientName: clientsTable.name,
        scope: consentsTable.scope,
        purpose: consentsTable.purpose,
        status: consentsTable.status,
        grantedAt: consentsTable.grantedAt,
        revokedAt: consentsTable.revokedAt,
        expiresAt: consentsTable.expiresAt
    })
    .from(consentsTable)
    .innerJoin(clientsTable, eq(consentsTable.clientId, clientsTable.id))
    .where(and(
        eq(consentsTable.id, consentId),
        eq(consentsTable.userId, userId)
    ));

    if (!consent) {
        throw new Error("Consent not found");
    }

    return consent;
};

export const revokeConsent = async (userId: string, consentId: string) => {
    const [existingConsent] = await db.select().from(consentsTable)
        .where(and(
            eq(consentsTable.id, consentId),
            eq(consentsTable.userId, userId)
        ));

    if (!existingConsent) {
        throw new Error("Consent not found");
    }

    const [updated] = await db.update(consentsTable)
        .set({
            status: "revoked",
            revokedAt: new Date()
        })
        .where(eq(consentsTable.id, consentId))
        .returning();

    return updated;
};
