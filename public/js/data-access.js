document.addEventListener('DOMContentLoaded', async () => {
    const accessList = document.getElementById('accessList');

    try {
        const res = await fetch('/api/data-access');
        if (res.status === 401) {
            window.location.href = '/home';
            return;
        }

        const data = await res.json();
        
        if (!data.accesses || data.accesses.length === 0) {
            accessList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No data access history found.</p>';
            return;
        }

        accessList.innerHTML = '';
        data.accesses.forEach(access => {
            const date = new Date(access.createdAt).toLocaleString();
            const requested = access.requestedScopes.join(', ') || 'None';
            const granted = access.grantedScopes.join(', ') || 'None';
            
            let statusClass = 'status-success';
            let statusText = 'Successful';

            if (!access.success || access.denialReason) {
                statusClass = 'status-partial';
                statusText = access.success ? 'Partial' : 'Denied';
            }

            const card = document.createElement('div');
            card.className = 'access-card';
            card.innerHTML = `
                <div class="access-header">
                    <span class="access-client">${access.clientName}</span>
                    <span class="access-time">${date}</span>
                </div>
                <div class="access-details">
                    <div><span class="access-label">Requested:</span> ${requested}</div>
                    <div><span class="access-label">Accessed:</span> ${granted}</div>
                    <div><span class="access-label">Purpose:</span> ${access.purpose}</div>
                    <div style="margin-top: 8px;">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        ${access.denialReason ? `<span style="margin-left: 8px; font-size: 12px; color: var(--text-secondary);">(${access.denialReason})</span>` : ''}
                    </div>
                </div>
            `;
            accessList.appendChild(card);
        });

    } catch (err) {
        accessList.innerHTML = '<p style="color: red; text-align: center;">Failed to load data access history.</p>';
    }
});
