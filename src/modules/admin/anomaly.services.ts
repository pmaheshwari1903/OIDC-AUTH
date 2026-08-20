import { db, dataAccessLogsTable, clientsTable } from '../../common/db/index.js'
import { eq, desc, count, sql, gte, and } from 'drizzle-orm'
import {
    ANOMALY_ACCESS_THRESHOLD,
    ANOMALY_TIME_WINDOW_MINUTES,
    ANOMALY_DENIAL_RATE,
    ANOMALY_SCOPE_SPIKE_MULTIPLIER,
    ANOMALY_MIN_REQUESTS
} from './anomaly.config.js'

interface Anomaly {
    clientName: string;
    type: "HIGH_ACCESS_FREQUENCY" | "HIGH_DENIAL_RATE" | "SCOPE_SPIKE";
    description: string;
    severity: "low" | "medium" | "high";
    detectedAt: string;
}

export const detectAnomalies = async (): Promise<Anomaly[]> => {
    const anomalies: Anomaly[] = [];
    const now = new Date();
    const windowStart = new Date(now.getTime() - ANOMALY_TIME_WINDOW_MINUTES * 60 * 1000);

    // Get all clients that have recent access logs
    const recentClientActivity = await db.select({
        clientId: dataAccessLogsTable.clientId,
        clientName: clientsTable.name,
        totalRecent: count(dataAccessLogsTable.id),
        deniedRecent: count(sql`CASE WHEN ${dataAccessLogsTable.success} = false THEN 1 END`)
    })
    .from(dataAccessLogsTable)
    .innerJoin(clientsTable, eq(dataAccessLogsTable.clientId, clientsTable.id))
    .where(gte(dataAccessLogsTable.createdAt, windowStart))
    .groupBy(dataAccessLogsTable.clientId, clientsTable.name);

    for (const client of recentClientActivity) {
        const totalRecent = Number(client.totalRecent);
        const deniedRecent = Number(client.deniedRecent);

        // Rule 1: High Access Frequency
        if (totalRecent > ANOMALY_ACCESS_THRESHOLD) {
            anomalies.push({
                clientName: client.clientName!,
                type: "HIGH_ACCESS_FREQUENCY",
                description: `Client made ${totalRecent} data-access requests in ${ANOMALY_TIME_WINDOW_MINUTES} minutes (threshold: ${ANOMALY_ACCESS_THRESHOLD})`,
                severity: "high",
                detectedAt: now.toISOString()
            });
        }

        // Rule 2: High Denial Rate
        if (totalRecent >= ANOMALY_MIN_REQUESTS) {
            const denialRate = deniedRecent / totalRecent;
            if (denialRate >= ANOMALY_DENIAL_RATE) {
                anomalies.push({
                    clientName: client.clientName!,
                    type: "HIGH_DENIAL_RATE",
                    description: `${Math.round(denialRate * 100)}% of requests were denied (${deniedRecent}/${totalRecent}, threshold: ${ANOMALY_DENIAL_RATE * 100}%)`,
                    severity: denialRate >= 0.9 ? "high" : "medium",
                    detectedAt: now.toISOString()
                });
            }
        }
    }

    // Rule 3: Scope Spike
    // Compare recent distinct scope count vs historical average per client
    const recentScopeCounts = await db.execute(sql`
        SELECT 
            dal.client_id,
            c.name as client_name,
            COUNT(DISTINCT unnest_scope) as recent_scope_count
        FROM data_access_logs dal
        INNER JOIN clients c ON dal.client_id = c.id
        CROSS JOIN LATERAL unnest(string_to_array(dal.requested_scopes, ',')) as unnest_scope
        WHERE dal.created_at >= ${windowStart}
        GROUP BY dal.client_id, c.name
    `);

    const historicalScopeCounts = await db.execute(sql`
        SELECT 
            dal.client_id,
            COUNT(DISTINCT unnest_scope) as historical_scope_count
        FROM data_access_logs dal
        CROSS JOIN LATERAL unnest(string_to_array(dal.requested_scopes, ',')) as unnest_scope
        WHERE dal.created_at < ${windowStart}
        GROUP BY dal.client_id
    `);

    // Build a map of historical scope counts
    const historicalMap = new Map<string, number>();
    const histRows = (recentScopeCounts as unknown as any).rows
        ? (historicalScopeCounts as unknown as any).rows
        : (historicalScopeCounts as unknown as any[]);

    for (const row of histRows) {
        historicalMap.set(row.client_id, Number(row.historical_scope_count));
    }

    const recentRows = (recentScopeCounts as unknown as any).rows
        ? (recentScopeCounts as unknown as any).rows
        : (recentScopeCounts as unknown as any[]);

    for (const row of recentRows) {
        const historicalCount = historicalMap.get(row.client_id) || 0;
        const recentCount = Number(row.recent_scope_count);

        // Only flag if there is historical data to compare against
        if (historicalCount > 0 && recentCount >= historicalCount * ANOMALY_SCOPE_SPIKE_MULTIPLIER) {
            anomalies.push({
                clientName: row.client_name,
                type: "SCOPE_SPIKE",
                description: `Client requested ${recentCount} distinct scopes recently vs ${historicalCount} historically (${ANOMALY_SCOPE_SPIKE_MULTIPLIER}x threshold)`,
                severity: "medium",
                detectedAt: new Date().toISOString()
            });
        }
    }

    return anomalies;
};
