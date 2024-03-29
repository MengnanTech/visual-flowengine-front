const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class HTTP {
    static async request(url: string, options = {}) {

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP request error: ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            // 返回 JSON 数据
            return await response.json();
        } else {
            // 返回字符串数据
            return await response.text();
        }
    }


    static get(url: string) {
        return this.request(`${API_BASE_URL}${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    static post(url: string, body: any) {
        return this.request(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });
    }

    static put(url: string, body: any) {
        return this.request(`${API_BASE_URL}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });
    }

    static delete(url: string) {
        return this.request(`${API_BASE_URL}${url}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}

export default HTTP;
