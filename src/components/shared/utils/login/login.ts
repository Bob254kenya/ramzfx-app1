// ======================================================
// MODERN DERIV LOGIN URL SYSTEM (FIXED)
// Supports:
// - New OAuth Flow
// - OAuth Client ID
// - Legacy App ID fallback
// - Redirect URI
// - Session Restore
// - Multi-domain support
// ======================================================

import { website_name } from '@/utils/site-config';

import {
    domain_app_ids,
    getAppId,
    DERIV_CLIENT_ID,
    DERIV_REDIRECT_URI,
} from '../config/config';

import {
    CookieStorage,
    isStorageSupported,
    LocalStore,
} from '../storage/storage';

import {
    getStaticUrl,
    urlForCurrentDomain,
} from '../url';

import { deriv_urls } from '../url/constants';

// ======================================================
// REDIRECT TO LOGIN
// ======================================================

export const redirectToLogin = (
    is_logged_in: boolean,
    language: string,
    has_params = true,
    redirect_delay = 0
) => {
    if (!is_logged_in && isStorageSupported(sessionStorage)) {
        const l = window.location;

        const redirect_url = has_params
            ? window.location.href
            : `${l.protocol}//${l.host}${l.pathname}`;

        sessionStorage.setItem('redirect_url', redirect_url);

        setTimeout(() => {
            const new_href = loginUrl({ language });

            window.location.href = new_href;
        }, redirect_delay);
    }
};

// ======================================================
// REDIRECT TO SIGNUP
// ======================================================

export const redirectToSignUp = () => {
    window.open(getStaticUrl('/signup/'));
};

// ======================================================
// TYPES
// ======================================================

type TLoginUrl = {
    language: string;
};

// ======================================================
// GENERATE OAUTH STATE
// ======================================================

const generateOAuthState = () => {
    return crypto.randomUUID();
};

// ======================================================
// LOGIN URL
// ======================================================

export const loginUrl = ({ language }: TLoginUrl) => {
    // ==================================================
    // SERVER URL
    // ==================================================

    const server_url = LocalStore.get('config.server_url');

    // ==================================================
    // MARKETING COOKIES
    // ==================================================

    const signup_device_cookie = new (CookieStorage as any)(
        'signup_device'
    );

    const signup_device =
        signup_device_cookie.get('signup_device');

    const date_first_contact_cookie = new (CookieStorage as any)(
        'date_first_contact'
    );

    const date_first_contact =
        date_first_contact_cookie.get(
            'date_first_contact'
        );

    const marketing_queries = `
        ${signup_device ? `&signup_device=${signup_device}` : ''}
        ${
            date_first_contact
                ? `&date_first_contact=${date_first_contact}`
                : ''
        }
    `.replace(/\s+/g, '');

    // ==================================================
    // OAUTH STATE (CSRF PROTECTION)
    // ==================================================

    const state = generateOAuthState();

    localStorage.setItem('deriv_oauth_state', state);

    // ==================================================
    // OAUTH SCOPES
    // ==================================================

    const scopes = [
        'read',
        'trade',
        'payments',
        'admin',
        'trading_information',
    ].join(' ');

    // ==================================================
    // BASE PARAMS
    // ==================================================

    const oauth_params = new URLSearchParams({
        client_id: DERIV_CLIENT_ID,
        redirect_uri: DERIV_REDIRECT_URI,
        response_type: 'code',
        scope: scopes,
        state,
        app_id: String(getAppId()), // legacy compatibility
        l: language,
        brand: website_name.toLowerCase(),
    });

    // ==================================================
    // FULL OAUTH URL
    // ==================================================

    const getOAuthUrl = () => {
        return `https://oauth.${deriv_urls.DERIV_HOST_NAME}/oauth2/authorize?${oauth_params.toString()}${marketing_queries}`;
    };

    // ==================================================
    // QA SERVER SUPPORT
    // ==================================================

    if (server_url && /qa/.test(server_url)) {
        return `https://${server_url}/oauth2/authorize?${oauth_params.toString()}${marketing_queries}`;
    }

    // ==================================================
    // SAME DOMAIN
    // ==================================================

    if (
        getAppId() ===
        domain_app_ids[
            window.location.hostname as keyof typeof domain_app_ids
        ]
    ) {
        return getOAuthUrl();
    }

    // ==================================================
    // CROSS DOMAIN
    // ==================================================

    return urlForCurrentDomain(getOAuthUrl());
};

// ======================================================
// HANDLE OAUTH CALLBACK
// ======================================================

export const handleOAuthCallback = async () => {
    const params = new URLSearchParams(
        window.location.search
    );

    const code = params.get('code');
    const state = params.get('state');

    if (!code) {
        return null;
    }

    // ==================================================
    // VERIFY STATE
    // ==================================================

    const saved_state =
        localStorage.getItem('deriv_oauth_state');

    if (state !== saved_state) {
        throw new Error('Invalid OAuth state');
    }

    // ==================================================
    // EXCHANGE TOKEN
    // ==================================================

    const response = await fetch(
        'https://oauth.deriv.com/oauth2/token',
        {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded',
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
        throw new Error(
            data.error.message || 'OAuth failed'
        );
    }

    // ==================================================
    // SAVE TOKENS
    // ==================================================

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
        localStorage.setItem(
            'deriv_token_expires_at',
            String(
                Date.now() + data.expires_in * 1000
            )
        );
    }

    // ==================================================
    // CLEAN URL
    // ==================================================

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );

    // ==================================================
    // REDIRECT BACK
    // ==================================================

    const redirect_url =
        sessionStorage.getItem('redirect_url');

    if (redirect_url) {
        sessionStorage.removeItem('redirect_url');

        window.location.href = redirect_url;
    }

    return data;
};

// ======================================================
// LOGOUT
// ======================================================

export const logoutDeriv = () => {
    [
        'deriv_access_token',
        'deriv_refresh_token',
        'deriv_token_expires_at',
        'deriv_oauth_state',
    ].forEach(key => localStorage.removeItem(key));

    window.location.href = '/login';
};

// ======================================================
// CHECK LOGIN STATUS
// ======================================================

export const isLoggedIn = () => {
    const token = localStorage.getItem(
        'deriv_access_token'
    );

    const expires_at = Number(
        localStorage.getItem(
            'deriv_token_expires_at'
        )
    );

    return !!token && Date.now() < expires_at;
};

// ======================================================
// RESTORE SESSION
// ======================================================

export const restoreSession = async () => {
    try {
        if (!isLoggedIn()) {
            return null;
        }

        const token = localStorage.getItem(
            'deriv_access_token'
        );

        const ws = new WebSocket(
            `wss://ws.derivws.com/websockets/v3?app_id=${getAppId()}`
        );

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

                if (data.msg_type === 'authorize') {
                    resolve(data);
                }

                if (data.error) {
                    reject(data.error);
                }
            };

            ws.onerror = error => {
                reject(error);
            };
        });
    } catch (error) {
        console.error(error);

        logoutDeriv();

        return null;
    }
};
