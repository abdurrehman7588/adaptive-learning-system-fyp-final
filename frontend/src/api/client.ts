import axios, { type InternalAxiosRequestConfig } from 'axios';
import { messageFromAxiosError } from './errors';
import { clearAuthStorage, getToken } from '../lib/tokenStorage';

/** In dev, use Vite proxy (/api → localhost:5000) to avoid cross-origin preflight issues. */
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/** Axios 1.x uses AxiosHeaders; plain assignment on `config.headers.Authorization` is often dropped. */
function setAuthorizationHeader(config: InternalAxiosRequestConfig, token: string): void {
    const value = `Bearer ${token}`;

    const headers = config.headers as InternalAxiosRequestConfig['headers'] & {
        set?: (name: string, value: string) => void;
    };

    if (typeof headers.set === 'function') {
        headers.set('Authorization', value);
        return;
    }

    (headers as Record<string, string>)['Authorization'] = value;
}

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        setAuthorizationHeader(config, token);
    }

    const headers = config.headers as InternalAxiosRequestConfig['headers'] & {
        set?: (name: string, value: string) => void;
    };
    if (typeof headers.set === 'function') {
        headers.set('Cache-Control', 'no-cache');
        headers.set('Pragma', 'no-cache');
    } else if (headers) {
        (headers as Record<string, string>)['Cache-Control'] = 'no-cache';
        (headers as Record<string, string>)['Pragma'] = 'no-cache';
    }

    return config;
});

/** Unwrap backend envelope `{ success, message, data }` for existing API helpers. */
apiClient.interceptors.response.use(
    (response) => {
        const body = response.data;
        if (
            body &&
            typeof body === 'object' &&
            body.success === true &&
            body.data !== undefined
        ) {
            response.data = body.data;
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401 && getToken()) {
            clearAuthStorage();
            window.dispatchEvent(new Event('auth:session-expired'));
        }

        const apiError = messageFromAxiosError(error);
        if (apiError) {
            return Promise.reject(apiError);
        }

        return Promise.reject(error);
    },
);
