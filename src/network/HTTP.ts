const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type RequestBody = BodyInit | object | null | undefined;

interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: RequestBody;
}

class HTTP {
    private static buildRequestInit(options: RequestOptions = {}): RequestInit {
        const headers = new Headers(options.headers);
        let body = options.body;

        if (
            body != null &&
            typeof body !== 'string' &&
            !(body instanceof FormData) &&
            !(body instanceof URLSearchParams) &&
            !(body instanceof Blob) &&
            !(body instanceof ArrayBuffer)
        ) {
            headers.set('Content-Type', 'application/json');
            body = JSON.stringify(body);
        }

        return {
            ...options,
            headers,
            body,
        };
    }

    private static async parseResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('content-type') || '';
        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(responseText || `HTTP request error: ${response.status}`);
        }

        if (!responseText) {
            return undefined as T;
        }

        if (contentType.includes('application/json')) {
            return JSON.parse(responseText) as T;
        }

        return responseText as T;
    }

    static async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, this.buildRequestInit(options));
        return this.parseResponse<T>(response);
    }

    static get<T>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
        return this.request<T>(url, {
            ...options,
            method: 'GET',
        });
    }

    static post<TResponse, TBody extends RequestBody = RequestBody>(url: string, body?: TBody, options?: Omit<RequestOptions, 'method' | 'body'>) {
        return this.request<TResponse>(url, {
            ...options,
            method: 'POST',
            body,
        });
    }

    static put<TResponse, TBody extends RequestBody = RequestBody>(url: string, body?: TBody, options?: Omit<RequestOptions, 'method' | 'body'>) {
        return this.request<TResponse>(url, {
            ...options,
            method: 'PUT',
            body,
        });
    }

    static delete<T>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
        return this.request<T>(url, {
            ...options,
            method: 'DELETE',
        });
    }
}

export default HTTP;
