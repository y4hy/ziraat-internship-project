import type { Row } from "../types/row";

export const BASE_URL = "http://localhost:5118";

/** Fetches a list and maps each API record into a grid Row. */
export async function getList<TApi, TData>(
    url: string,
    map: (item: TApi) => Row<TData>,
): Promise<Row<TData>[]> {
    const res = await fetch(url);
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

    const res = await fetch(url, {
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
