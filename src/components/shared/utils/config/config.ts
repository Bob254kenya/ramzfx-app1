// ======================================================
// DERIV MODERN AUTH SYSTEM (OAuth + WebSocket API)
// Compatible with new Deriv authentication flow
// ======================================================

// ======================================================
// APP IDS
// ======================================================

export const APP_IDS = {
    LOCALHOST: 36300,
    STAGING: 29934,
    PRODUCTION: 131592,
};

// ======================================================
// OAUTH CONFIG
// ======================================================

// OAuth Client ID from Deriv Developer Dashboard
export const DERIV_CLIENT_ID = '32ZV1tqChTs1hNdvQ7skk';

// MUST match EXACTLY what is configured in Deriv Dashboard
export const DERIV_REDIRECT_URI = 'https://ramzfx.site';

// Legacy App ID support
export const DERIV_APP_ID = APP_IDS.PRODUCTION;

// ======================================================
// DOMAIN CONFIG
// ======================================================

export const domain_app_ids = {
    'ramzfx.site': APP_IDS.PRODUCTION,
    'www.ramzfx.site': APP_IDS.PRODUCTION,
    'bossiousfx.vercel.app': APP_IDS.PRODUCTION,
};

// ======================================================
// HELPERS
// ======================================================

export const isLocal = () =>
    /localhost(:\d+)?$/i.test(window.location.hostname);

export const isProduction = () => {
    const all_domains = Object.keys(domain_app_ids).map(
        domain => `(www\\.)?${domain.replace('.', '\\.')}`
    );

    return new RegExp(`^(${all_domains.join('|')})$`, 'i').test(
        window.location.hostname
    );
};

export const getCurrentProductionDomain = () =>
    !/^staging\./.test(window.location.hostname) &&
    Object.keys(domain_app_ids).find(
        domain => window.location.hostname === domain
    );

// ======================================================
// WEBSOCKET SERVER
// ======================================================

export const getSocketURL = () => {
    const local_storage_server_url =
        window.localStorage.getItem('config.server_url');

    if (local_storage_server_url) {
        return local_storage_server_url;
    }

    return 'ws.derivws.com';
};

// ======================================================
// APP ID
// ======================================================

export const getAppId = () => {
    if (import.meta.env.VITE_DERIV_APP_ID) {
        return import.meta.env.VITE_DERIV_APP_ID;
    }

    const current_domain = getCurrentProductionDomain() ?? '';

    let app_id = APP_IDS.PRODUCTION;

    if (isLocal()) {
        app_id = APP_IDS.LOCALHOST;
    } else {
        app_id =
            domain_app_ids[current_domain] ??
            APP_IDS.PRODUCTION;
    }

    localStorage.setItem('config.app_id', String(app_id));

    return app_id;
};

// ======================================================
// WEBSOCKET URL
// ======================================================

export const DERIV_WS_URL = () => {
    const server_url = getSocketURL();
    const app_id = getAppId();

    return `wss://${server_url}/websockets/v3?app_id=${app_id}`;
};

// ======================================================
// MODERN OAUTH URL GENERATOR
// ======================================================

export const generateOAuthURL = () => {
    const state = crypto.randomUUID();

    localStorage.setItem('deriv_oauth_state', state);

    const scopes = [
        'read',
        'trade',
        'payments',
        'admin',
        'trading_information'
    ].join(' ');

    const params = new URLSearchParams({
        client_id: DERIV_CLIENT_ID,
        redirect_uri: DERIV_REDIRECT_URI,
        response_type: 'code',
        scope: scopes,
        state,
    });

    return `https://oauth.deriv.com/oauth2/authorize?${params.toString()}`;
};

// ======================================================
// LOGIN
// ======================================================

export const loginWithDeriv = () => {
    window.location.href = generateOAuthURL();
};

// ======================================================
// EXCHANGE AUTHORIZATION CODE FOR ACCESS TOKEN
// ======================================================

export const exchangeCodeForToken = async (code) => {
    try {
        const response = await fetch(
            'https://oauth.deriv.com/oauth2/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    client_id: DERIV_CLIENT_ID,
                    redirect_uri: DERIV_REDIRECT_URI,
                }),
            }
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'OAuth failed');
        }

        // Store tokens securely
        localStorage.setItem(
            'deriv_access_token',
            data.access_token
        );

        if (data.refresh_token) {
            localStorage.setItem(
                'deriv_refresh_token',
                data.refresh_token
            );
        }

        if (data.expires_in) {
            const expires_at =
                Date.now() + data.expires_in * 1000;

            localStorage.setItem(
                'deriv_token_expires_at',
                String(expires_at)
            );
        }

        return data;
    } catch (error) {
        console.error('OAuth token exchange failed:', error);
        throw error;
    }
};

// ======================================================
// REFRESH ACCESS TOKEN
// ======================================================

export const refreshAccessToken = async () => {
    const refresh_token =
        localStorage.getItem('deriv_refresh_token');

    if (!refresh_token) {
        throw new Error('No refresh token found');
    }

    const response = await fetch(
        'https://oauth.deriv.com/oauth2/token',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token,
                client_id: DERIV_CLIENT_ID,
            }),
        }
    );

    const data = await response.json();

    if (data.error) {
        logoutDeriv();
        throw new Error(data.error.message);
    }

    localStorage.setItem(
        'deriv_access_token',
        data.access_token
    );

    return data.access_token;
};

// ======================================================
// GET VALID TOKEN
// ======================================================

export const getValidAccessToken = async () => {
    const token = localStorage.getItem('deriv_access_token');

    const expires_at = Number(
        localStorage.getItem('deriv_token_expires_at')
    );

    // Token still valid
    if (token && Date.now() < expires_at - 60000) {
        return token;
    }

    // Refresh token
    return await refreshAccessToken();
};

// ======================================================
// CREATE AUTHORIZED WEBSOCKET
// ======================================================

export const createDerivConnection = async () => {
    const token = await getValidAccessToken();

    const ws = new WebSocket(DERIV_WS_URL());

    return new Promise((resolve, reject) => {
        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    authorize: token,
                })
            );
        };

        ws.onmessage = event => {
            const data = JSON.parse(event.data);

            // Authorized successfully
            if (data.msg_type === 'authorize') {
                console.log('Deriv Authorized:', data);

                localStorage.setItem(
                    'deriv_loginid',
                    data.authorize.loginid
                );

                localStorage.setItem(
                    'deriv_currency',
                    data.authorize.currency
                );

                resolve(ws);
            }

            // Error
            if (data.error) {
                console.error('Authorization Error:', data.error);

                reject(data.error);
            }
        };

        ws.onerror = error => {
            reject(error);
        };
    });
};

// ======================================================
// AUTO SESSION RESTORE
// ======================================================

export const restoreDerivSession = async () => {
    try {
        const token =
            localStorage.getItem('deriv_access_token');

        if (!token) {
            return null;
        }

        const ws = await createDerivConnection();

        return ws;
    } catch (error) {
        console.error('Session restore failed:', error);

        logoutDeriv();

        return null;
    }
};

// ======================================================
// USER INFO
// ======================================================

export const getStoredUser = () => {
    return {
        loginid: localStorage.getItem('deriv_loginid'),
        currency: localStorage.getItem('deriv_currency'),
    };
};
