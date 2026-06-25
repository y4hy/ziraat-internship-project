import type { Row } from "../types/row";
import { clearToken, getToken } from "./authStore";

export const BASE_URL = "http://localhost:5118";

/**
 * fetch wrapper that attaches the bearer token and, on a 401, clears the token
 * (which sends the app back to the login screen via the authStore subscription).
 */
export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const token = getToken();
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(url, { ...init, headers });
    if (res.status === 401) {
        clearToken();
        throw new Error("Your session has expired. Please log in again.");
    }
    return res;
}

/** Fetches a list and maps each API record into a grid Row. */
export async function getList<TApi, TData>(
    url: string,
    map: (item: TApi) => Row<TData>,
): Promise<Row<TData>[]> {
    const res = await authFetch(url);
    if (!res.ok) throw new Error("Failed to load data.");
    const data: TApi[] = await res.json();
    return data.map(map);
}

/** Posts the batch of rows and maps the refreshed records the server returns. */
export async function postBatch<TApi, TData>(
    url: string,
    rows: Row<TData>[],
    map: (item: TApi) => Row<TData>,
): Promise<Row<TData>[]> {
    const body = {
        rows: rows.map((r) => ({ id: r.id, rowStatus: r.status, data: r.data })),
    };

    const res = await authFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const messages: string[] = [];
        if (payload?.errors) {
            for (const [key, msg] of Object.entries(payload.errors)) {
                messages.push(`[${key}]: ${msg}`);
            }
        }
        throw new Error(messages.length ? messages.join("\n") : "Save failed.");
    }

    const data: TApi[] = await res.json();
    return data.map(map);
}
