/**
 * Application-wide constants
 */

export const APP_NAME = 'Brand Identity Design System';
export const APP_VERSION = '0.1.0';

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    PROFILE: '/users/profile',
    BY_ID: (id: string) => `/users/${id}`,
  },
  ROLE_MODELS: {
    ALL: '/role-models',
    BY_ID: (id: string) => `/role-models/${id}`,
    CREATE: '/role-models',
    UPDATE: (id: string) => `/role-models/${id}`,
    DELETE: (id: string) => `/role-models/${id}`,
  },
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME: 'theme',
  USER_PREFERENCES: 'user-preferences',
};

/**
 * Route paths
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  LOGIN: '/login',
  SIGNUP: '/signup',
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully!',
  DELETED: 'Deleted successfully!',
  CREATED: 'Created successfully!',
};

