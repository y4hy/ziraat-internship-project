import { useState, useCallback } from "react";
import type { CustomerRow, CustomerData } from "../types/customer";
import { getAllCustomers, saveBatch } from "../api/customerApi";

export function useCustomerRows() {
    const [rows, setRows] = useState<CustomerRow[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const loadInitial = useCallback(async () => {
        const data = await getAllCustomers();
        setRows(data);
    }, []);

    const addRow = useCallback((data: CustomerData) => {
        setRows((prev) => [...prev, { id: null, status: "Added", data }]);
    }, []);

    const updateRow = useCallback((index: number, data: CustomerData) => {
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
    }, [rows]);

    return { rows, saving, saveError, loadInitial, addRow, updateRow, deleteRow, save };
}
