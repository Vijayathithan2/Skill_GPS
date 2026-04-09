export const BACKEND_URL = "http://localhost:5000/api";

export async function fetchFromBackend(path: string, options: RequestInit = {}) {
    try {
        const response = await fetch(`${BACKEND_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
        if (!response.ok) throw new Error(`Backend Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`Fetch error at ${path}:`, error);
        throw error;
    }
}
