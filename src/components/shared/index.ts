// src/components/shared/index.ts
// Export config first (includes OAuth functions)
export * from './utils/config';

// Export everything else except the conflicting modules
export * from './services';
export * from './utils/array';
export * from './utils/brand';
export * from './utils/browser';
export * from './utils/constants';
export * from './utils/contract';
export * from './utils/currency';
export * from './utils/date';
export * from './utils/digital-options';
export * from './utils/dom';
export * from './utils/files';
export * from './utils/helpers';
export * from './utils/hooks';
export * from './utils/loader';
export * from './utils/loader-handler';
export * from './utils/location';
export * from './utils/number';
export * from './utils/object';
export * from './utils/os';
export * from './utils/promise';
export * from './utils/routes';
export * from './utils/screen';
export * from './utils/shortcode';
export * from './utils/storage';
export * from './utils/string';
export * from './utils/types';
export * from './utils/url';
export * from './utils/validation';
export * from './utils/validator';

// Export only non-conflicting functions from login
export {
    redirectToLogin,
    redirectToSignUp,
    loginUrl,
    isLoggedIn,
    restoreSession,
} from './utils/login';
