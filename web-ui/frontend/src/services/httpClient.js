import { API_BASE_URL } from '../config/env';
import { authStore } from './authStore';

class ApiError extends Error {
    constructor(message, status, payload) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
    }
}

const buildUrl = (path) => {
    if (!path.startsWith('/')) {
        throw new Error(`API path must start with '/': ${path}`);
    }
    return `${API_BASE_URL}${path}`;
};

const toJson = async (response) => {
    const text = await response.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch (_e) {
        return { detail: text };
    }
};

const request = async (path, options = {}) => {
    const token = authStore.getToken();
    const headers = {
        Accept: 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(path), {
        ...options,
        headers
    });

    const payload = await toJson(response);

    if (!response.ok) {
        const message = payload?.detail || payload?.message || `Request failed: ${response.status}`;
        throw new ApiError(message, response.status, payload);
    }

    return payload;
};

export const httpClient = {
    get(path) {
        return request(path, { method: 'GET' });
    },
    post(path, body, options = {}) {
        const isFormData = body instanceof FormData;
        return request(path, {
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body),
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...(options.headers || {})
            }
        });
    },
    put(path, body, options = {}) {
        return request(path, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
    }
};

export { ApiError };
