import { useState, useCallback } from "react";
import type { Row } from "../types/row";

/**
 * Generic grid-row state shared by every tab: tracks Added/Modified/Deleted/Unchanged
 * status locally and flushes the batch through the supplied API on save.
 * `getAll` and `saveBatch` must be stable references (module-level functions).
 */
export function useRows<TData>(
    getAll: () => Promise<Row<TData>[]>,
    saveBatch: (rows: Row<TData>[]) => Promise<Row<TData>[]>,
) {
    const [rows, setRows] = useState<Row<TData>[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const loadInitial = useCallback(async () => {
        setRows(await getAll());
    }, [getAll]);

    const addRow = useCallback((data: TData) => {
        setRows((prev) => [...prev, { id: null, status: "Added", data }]);
    }, []);

    const updateRow = useCallback((index: number, data: TData) => {
        setRows((prev) =>
            prev.map((row, i) => {
                if (i !== index) return row;
                return {
                    ...row,
                    data,
                    status: row.status === "Unchanged" ? "Modified" : row.status,
                };
            })
        );
    }, []);

    const deleteRow = useCallback((index: number) => {
        setRows((prev) => {
            const row = prev[index];
            if (row.status === "Added") {
                return prev.filter((_, i) => i !== index);
            }
            return prev.map((r, i) => (i === index ? { ...r, status: "Deleted" } : r));
        });
    }, []);

    const save = useCallback(async () => {
        setSaving(true);
        setSaveError(null);
        try {
            const updated = await saveBatch(rows);
            setRows(updated);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Unknown error.");
        } finally {
            setSaving(false);
        }
    }, [rows, saveBatch]);

    return { rows, saving, saveError, loadInitial, addRow, updateRow, deleteRow, save };
}
