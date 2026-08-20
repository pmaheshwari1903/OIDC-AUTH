import { db, dataAccessLogsTable, clientsTable } from '../../common/db/index.js'
import { eq, desc, countDistinct, count, sql } from 'drizzle-orm'

export const getObservabilityMetrics = async () => {
    // 1. Total, Successful, Denied Accesses
    const [counts] = await db.select({
        total: count(dataAccessLogsTable.id),
        successful: count(sql`CASE WHEN ${dataAccessLogsTable.success} = true THEN 1 END`),
        denied: count(sql`CASE WHEN ${dataAccessLogsTable.success} = false THEN 1 END`)
    }).from(dataAccessLogsTable);

    // 2. Active Clients Count
    const [clientsCount] = await db.select({
        activeClients: countDistinct(dataAccessLogsTable.clientId)
    }).from(dataAccessLogsTable);

    // 3. Top Clients
    const topClients = await db.select({
        clientName: clientsTable.name,
        accessCount: count(dataAccessLogsTable.id)
    })
    .from(dataAccessLogsTable)
    .innerJoin(clientsTable, eq(dataAccessLogsTable.clientId, clientsTable.id))
    .groupBy(dataAccessLogsTable.clientId, clientsTable.name)
    .orderBy(desc(count(dataAccessLogsTable.id)))
    .limit(5);

    // 4. Top Scopes
    // Using Postgres unnest and string_to_array to split the comma-separated strings
    const topScopes = await db.execute(sql`
        SELECT scope, count(*) as request_count
        FROM (
            SELECT unnest(string_to_array(requested_scopes, ',')) as scope
            FROM data_access_logs
            WHERE requested_scopes != ''
        ) as scopes
        GROUP BY scope
        ORDER BY request_count DESC
        LIMIT 5
    `);

    // 5. Recent Accesses
    const recentAccesses = await db.select({
        clientName: clientsTable.name,
        endpoint: dataAccessLogsTable.endpoint,
        grantedScopes: dataAccessLogsTable.grantedScopes,
        success: dataAccessLogsTable.success,
        createdAt: dataAccessLogsTable.createdAt
    })
    .from(dataAccessLogsTable)
    .innerJoin(clientsTable, eq(dataAccessLogsTable.clientId, clientsTable.id))
    .orderBy(desc(dataAccessLogsTable.createdAt))
    .limit(10);

    return {
        totalAccesses: Number(counts.total) || 0,
        successfulAccesses: Number(counts.successful) || 0,
        deniedAccesses: Number(counts.denied) || 0,
        activeClients: Number(clientsCount.activeClients) || 0,
        topClients: topClients.map(tc => ({
            clientName: tc.clientName,
            accessCount: Number(tc.accessCount)
        })),
        topScopes: ((topScopes as unknown as any).rows || (topScopes as unknown as any[])).map((ts: any) => ({
            scope: ts.scope,
            requestCount: Number(ts.request_count)
        })),
        recentAccesses: recentAccesses.map(ra => ({
            ...ra,
            grantedScopes: ra.grantedScopes.split(",").filter(Boolean)
        }))
    };
};
