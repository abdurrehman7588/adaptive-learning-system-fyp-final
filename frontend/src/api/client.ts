import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getToken } from '../lib/tokenStorage';

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
