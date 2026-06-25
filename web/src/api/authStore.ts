/**
 * Module-level holder for the JWT, backed by localStorage so the session
 * survives page reloads. Components subscribe to be notified on login/logout
 * (including the automatic logout the fetch helpers trigger on a 401).
 */
const TOKEN_KEY = "ziraat.token";

let token: string | null = localStorage.getItem(TOKEN_KEY);
const listeners = new Set<() => void>();

export function getToken(): string | null {
    return token;
}

export function setToken(value: string): void {
    token = value;
    localStorage.setItem(TOKEN_KEY, value);
    notify();
}

export function clearToken(): void {
    token = null;
    localStorage.removeItem(TOKEN_KEY);
    notify();
}

export function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notify(): void {
    listeners.forEach((fn) => fn());
}
