document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const dashboard = document.getElementById('dashboard');

    try {
        const res = await fetch('/api/admin/observability');
        if (res.status === 401 || res.status === 403) {
            window.location.href = '/home';
            return;
        }

        const data = await res.json();
        
        document.getElementById('valTotal').textContent = data.totalAccesses.toLocaleString();
        document.getElementById('valSuccess').textContent = data.successfulAccesses.toLocaleString();
        document.getElementById('valDenied').textContent = data.deniedAccesses.toLocaleString();
        document.getElementById('valClients').textContent = data.activeClients.toLocaleString();

        const clientsTbody = document.getElementById('topClientsTable');
        clientsTbody.innerHTML = data.topClients.map(c => `
            <tr><td>${c.clientName}</td><td>${c.accessCount.toLocaleString()}</td></tr>
        `).join('');

        const scopesTbody = document.getElementById('topScopesTable');
        scopesTbody.innerHTML = data.topScopes.map(s => `
            <tr><td>${s.scope}</td><td>${s.requestCount.toLocaleString()}</td></tr>
        `).join('');

        const recentTbody = document.getElementById('recentAccessTable');
        recentTbody.innerHTML = data.recentAccesses.map(r => {
            const time = new Date(r.createdAt).toLocaleString();
            const scopes = r.grantedScopes.join(', ') || 'None';
            const statusClass = r.success ? 'status-success' : 'status-denied';
            const statusText = r.success ? 'Successful' : 'Denied';
            return `
                <tr>
                    <td><strong>${r.clientName}</strong></td>
                    <td>${scopes}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${time}</td>
                </tr>
            `;
        }).join('');

        loading.style.display = 'none';
        dashboard.style.display = 'block';

        // Fetch anomalies
        try {
            const anomalyRes = await fetch('/api/admin/anomalies');
            const anomalyData = await anomalyRes.json();
            const anomalyList = document.getElementById('anomalyList');

            if (!anomalyData.anomalies || anomalyData.anomalies.length === 0) {
                anomalyList.innerHTML = '<p style="color: var(--text-secondary);">No security alerts detected.</p>';
            } else {
                anomalyList.innerHTML = anomalyData.anomalies.map(a => {
                    const typeDisplay = a.type.replace(/_/g, ' ');
                    return `
                        <div class="alert-card severity-${a.severity}">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <strong>${a.clientName}</strong>
                                <span class="alert-severity" style="color: ${a.severity === 'high' ? '#c5221f' : a.severity === 'medium' ? '#e37400' : '#1a73e8'};">${a.severity}</span>
                            </div>
                            <div class="alert-type" style="color: ${a.severity === 'high' ? '#c5221f' : '#e37400'}; margin-top: 4px;">${typeDisplay}</div>
                            <div class="alert-desc">${a.description}</div>
                        </div>
                    `;
                }).join('');
            }
        } catch (anomalyErr) {
            document.getElementById('anomalyList').innerHTML = '<p style="color: var(--text-secondary);">Could not load alerts.</p>';
        }

    } catch (err) {
        loading.textContent = 'Failed to load dashboard. Ensure you have admin access.';
        loading.style.color = 'red';
    }

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '/home';
    });
});
