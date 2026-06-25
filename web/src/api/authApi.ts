import { BASE_URL } from "./batch";

export async function login(username: string, password: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Login failed.");
    }

    const data: { token: string } = await res.json();
    return data.token;
}
