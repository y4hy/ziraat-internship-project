import { useState } from "react";
import {
    type AccountRow,
    type AccountData,
    type AccountType,
    type Currency,
    ACCOUNT_TYPES,
    CURRENCIES,
    ACCOUNT_TYPE_LABEL,
    CURRENCY_LABEL,
} from "../types/account";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "./Pagination";

interface Props {
    rows: AccountRow[];
    onUpdate: (index: number, data: AccountData) => void;
    onDelete: (index: number) => void;
}

export function AccountGrid({ rows, onUpdate, onDelete }: Props) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<AccountData | null>(null);
    const { page, setPage, totalPages, pageItems, startIndex } = usePagination(rows);

    function startEdit(index: number) {
        setEditingIndex(index);
        setEditForm({ ...rows[index].data });
    }

    function cancelEdit() {
        setEditingIndex(null);
        setEditForm(null);
    }

    function commitEdit(index: number) {
        if (editForm) onUpdate(index, editForm);
        setEditingIndex(null);
        setEditForm(null);
    }

    function set<K extends keyof AccountData>(key: K, value: AccountData[K]) {
        setEditForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    }

    return (
        <div style={{ overflowX: "auto", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                    <tr style={{ background: "#e0e0e0" }}>
                        <th style={th}>Status</th>
                        <th style={th}>ID</th>
                        <th style={th}>Account Number</th>
                        <th style={th}>Account Type</th>
                        <th style={th}>Currency</th>
                        <th style={th}>Balance</th>
                        <th style={th}>Active</th>
                        <th style={th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pageItems.map((row, li) => {
                        const i = startIndex + li;
                        const isDeleted = row.status === "Deleted";
                        const isEditing = editingIndex === i;
                        const rowStyle: React.CSSProperties = {
                            opacity: isDeleted ? 0.4 : 1,
                            textDecoration: isDeleted ? "line-through" : "none",
                            background: row.status === "Added" ? "#e8f5e9" : row.status === "Modified" ? "#fff8e1" : "white",
                        };

                        if (isEditing && editForm) {
                            return (
                                <tr key={i} style={{ background: "#e3f2fd" }}>
                                    <td style={td}>{row.status}</td>
                                    <td style={td}>{row.id ?? "—"}</td>
                                    <td style={td}><input value={editForm.accountNumber} maxLength={34} onChange={(e) => set("accountNumber", e.target.value)} style={{ width: "100%" }} /></td>
                                    <td style={td}>
                                        <select value={editForm.accountType} onChange={(e) => set("accountType", Number(e.target.value) as AccountType)}>
                                            {ACCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </td>
                                    <td style={td}>
                                        <select value={editForm.currency} onChange={(e) => set("currency", Number(e.target.value) as Currency)}>
                                            {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </td>
                                    <td style={td}><input type="number" min={0} step="0.01" value={editForm.balance} onChange={(e) => set("balance", Number(e.target.value))} style={{ width: 110 }} /></td>
                                    <td style={td}>
                                        <select value={editForm.isActive ? "1" : "0"} onChange={(e) => set("isActive", e.target.value === "1")}>
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                    </td>
                                    <td style={td}>
                                        <button onClick={() => commitEdit(i)} style={{ marginRight: 4 }}>Save</button>
                                        <button onClick={cancelEdit}>Cancel</button>
                                    </td>
                                </tr>
                            );
                        }

                        return (
                            <tr key={i} style={rowStyle}>
                                <td style={td}>{row.status}</td>
                                <td style={td}>{row.id ?? "—"}</td>
                                <td style={td}>{row.data.accountNumber || <span style={{ color: "#999" }}>(new)</span>}</td>
                                <td style={td}>{ACCOUNT_TYPE_LABEL[row.data.accountType]}</td>
                                <td style={td}>{CURRENCY_LABEL[row.data.currency]}</td>
                                <td style={td}>{row.data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={td}>{row.data.isActive ? "Yes" : "No"}</td>
                                <td style={td}>
                                    {!isDeleted && (
                                        <>
                                            <button onClick={() => startEdit(i)} style={{ marginRight: 4 }}>Edit</button>
                                            <button onClick={() => onDelete(i)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={8} style={{ ...td, textAlign: "center", color: "#999" }}>Enter a customer number and click “List Accounts”.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {rows.length > 0 && (
                <Pagination page={page} totalPages={totalPages} totalItems={rows.length} onPage={setPage} />
            )}
        </div>
    );
}

const th: React.CSSProperties = {
    padding: "8px 12px",
    textAlign: "left",
    borderBottom: "2px solid #ccc",
    whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
    padding: "6px 12px",
    borderBottom: "1px solid #eee",
};
