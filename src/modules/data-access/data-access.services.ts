import { db, dataAccessLogsTable, clientsTable } from '../../common/db/index.js'
import { eq, desc } from 'drizzle-orm'

export const getUserDataAccess = async (userId: string) => {
    const logs = await db.select({
        id: dataAccessLogsTable.id,
        clientName: clientsTable.name,
        endpoint: dataAccessLogsTable.endpoint,
        requestedScopes: dataAccessLogsTable.requestedScopes,
        grantedScopes: dataAccessLogsTable.grantedScopes,
        purpose: dataAccessLogsTable.purpose,
        success: dataAccessLogsTable.success,
        denialReason: dataAccessLogsTable.denialReason,
        createdAt: dataAccessLogsTable.createdAt
    })
    .from(dataAccessLogsTable)
    .innerJoin(clientsTable, eq(dataAccessLogsTable.clientId, clientsTable.id))
    .where(eq(dataAccessLogsTable.userId, userId))
    .orderBy(desc(dataAccessLogsTable.createdAt));

    return logs.map(log => ({
        ...log,
        requestedScopes: log.requestedScopes.split(",").filter(Boolean),
        grantedScopes: log.grantedScopes.split(",").filter(Boolean)
    }));
};
