document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('client_id');
    const scopeString = urlParams.get('scope') || '';
    const redirectUri = urlParams.get('redirect_uri');
    const state = urlParams.get('state');
    const purpose = urlParams.get('purpose') || 'authentication';

    const clientNameDisplay = document.getElementById('clientNameDisplay');
    const scopesList = document.getElementById('scopesList');
    const errorMessage = document.getElementById('errorMessage');
    const consentForm = document.getElementById('consentForm');
    const denyBtn = document.getElementById('denyBtn');
    const allowBtn = document.getElementById('allowBtn');

    if (!clientId || !redirectUri) {
        showError('Invalid authorization request: missing client_id or redirect_uri.');
        return;
    }

    try {
        // Fetch client details
        const response = await fetch(`/api/clients/public/${clientId}`);
        if (!response.ok) {
            throw new Error('Failed to load client details.');
        }
        
        const data = await response.json();
        clientNameDisplay.textContent = data.client.name;
    } catch (err) {
        showError('Invalid or unknown client application.');
        return;
    }

    // Display purpose
    const purposeDisplay = document.getElementById('purposeDisplay');
    purposeDisplay.textContent = purpose.charAt(0).toUpperCase() + purpose.slice(1);

    // Display requested scopes
    const scopes = scopeString.split(' ').filter(Boolean);
    if (scopes.length === 0) {
        const li = document.createElement('li');
        li.textContent = "No specific data requested.";
        li.style.color = "var(--text-secondary)";
        li.style.fontSize = "14px";
        scopesList.appendChild(li);
    } else {
        scopes.forEach(s => {
            if (s === 'openid') return; // Skip showing openid as it's a protocol scope
            
            const li = document.createElement('li');
            li.style.marginBottom = "8px";
            li.style.color = "var(--text-secondary)";
            li.style.fontSize = "14px";
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.gap = "8px";
            
            // Simple display mapping
            const scopeDisplay = {
                'profile': 'Basic profile information (name, picture)',
                'email': 'Email address',
                'location': 'Approximate location (city, country)',
                'interests': 'Personal interests'
            }[s] || s;

            li.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-color)"><path d="M20 6L9 17l-5-5"></path></svg> ${scopeDisplay}`;
            scopesList.appendChild(li);
        });
    }

    // Handle Deny
    denyBtn.addEventListener('click', () => {
        let redirect = `${redirectUri}?error=access_denied`;
        if (state) redirect += `&state=${encodeURIComponent(state)}`;
        window.location.href = redirect;
    });

    // Handle Allow
    consentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        allowBtn.disabled = true;
        allowBtn.textContent = 'Processing...';

        try {
            const res = await fetch('/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: clientId,
                    scope: scopeString,
                    redirect_uri: redirectUri,
                    state: state || undefined,
                    decision: 'allow',
                    purpose: purpose
                })
            });

            const data = await res.json();
            
            if (res.ok && data.redirectUri) {
                window.location.href = data.redirectUri;
            } else {
                showError(data.message || 'Failed to process consent.');
            }
        } catch (err) {
            showError('A network error occurred.');
        } finally {
            allowBtn.disabled = false;
            allowBtn.textContent = 'Allow Access';
        }
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
        allowBtn.disabled = true;
        denyBtn.disabled = true;
    }
});
