const trimTrailingSlash = (value) => value.replace(/\/$/, '');

const rawApiBase = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = rawApiBase ? trimTrailingSlash(rawApiBase) : '/api';

export const APP_ENV = import.meta.env.MODE;
