import { isAxiosError } from 'axios';

export type ApiErrorPayload = {
    code?: string;
    errors?: Array<{ field?: string; message?: string }>;
};

/** Structured API failure preserved through the axios interceptor. */
export class ApiRequestError extends Error {
    readonly status: number;
    readonly code?: string;
    readonly errors: ApiErrorPayload['errors'];

    constructor(
        message: string,
        status: number,
        options?: { code?: string; errors?: ApiErrorPayload['errors'] },
    ) {
        super(message);
        this.name = 'ApiRequestError';
        this.status = status;
        this.code = options?.code;
        this.errors = options?.errors;
    }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
    return error instanceof ApiRequestError;
}

export function parseEnvelopeErrorBody(body: unknown): {
    message: string;
    code?: string;
    errors?: ApiErrorPayload['errors'];
} | null {
    if (!body || typeof body !== 'object') {
        return null;
    }

    const record = body as Record<string, unknown>;
    if (record.success !== false) {
        return null;
    }

    const message =
        typeof record.message === 'string' && record.message.trim()
            ? record.message
            : 'Request failed';

    const nested = record.data;
    if (!nested || typeof nested !== 'object') {
        return { message };
    }

    const data = nested as Record<string, unknown>;
    const code = typeof data.code === 'string' ? data.code : undefined;
    const errors = Array.isArray(data.errors) ? (data.errors as ApiErrorPayload['errors']) : undefined;

    return { message, code, errors };
}

export function messageFromAxiosError(error: unknown): ApiRequestError | null {
    if (!isAxiosError(error) || !error.response) {
        return null;
    }

    const { status, data } = error.response;
    const parsed = parseEnvelopeErrorBody(data);
    if (parsed) {
        return new ApiRequestError(parsed.message, status, {
            code: parsed.code,
            errors: parsed.errors,
        });
    }

    if (typeof data === 'string' && data.trim()) {
        return new ApiRequestError(data.trim(), status);
    }

    const fallback =
        status === 400
            ? 'Bad request. Check your details (password must be at least 8 characters).'
            : status === 401
              ? 'Invalid email or password.'
              : status === 409
                ? 'An account with this email already exists. Try signing in instead.'
                : status === 422
                  ? 'Some fields are invalid. Check the form and try again.'
                  : status === 429
                    ? 'Too many attempts. Wait a minute and try again.'
                    : 'Request failed. Please try again.';

    return new ApiRequestError(fallback, status);
}
