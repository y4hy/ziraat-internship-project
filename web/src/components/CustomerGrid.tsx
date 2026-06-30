import { useState } from "react";
import type { CustomerRow, CustomerData } from "../types/customer";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "./Pagination";

interface Props {
    rows: CustomerRow[];
    onUpdate: (index: number, data: CustomerData) => void;
    onDelete: (index: number) => void;
}

const onlyDigits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

const GENDER_LABEL: Record<string, string> = { M: "Male", F: "Female" };
const TYPE_LABEL: Record<number, string> = { 1: "Individual", 2: "Corporate" };
const NAT_LABEL: Record<number, string> = { 1: "Citizen", 2: "Foreign national" };

export function CustomerGrid({ rows, onUpdate, onDelete }: Props) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<CustomerData | null>(null);
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

    function set<K extends keyof CustomerData>(key: K, value: CustomerData[K]) {
        setEditForm((prev) => prev ? { ...prev, [key]: value } : prev);
    }

    return (
        <div style={{ overflowX: "auto", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                    <tr style={{ background: "#e0e0e0" }}>
                        <th style={th}>Status</th>
                        <th style={th}>ID</th>
                        <th style={th}>First Name</th>
                        <th style={th}>Last Name</th>
                        <th style={th}>National/Tax #</th>
                        <th style={th}>Gender</th>
                        <th style={th}>Type</th>
                        <th style={th}>Nationality</th>
                        <th style={th}>Age</th>
                        <th style={th}>Branch</th>
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
                                    <td style={td}><input value={editForm.firstName} maxLength={150} onChange={(e) => set("firstName", e.target.value)} style={{ width: "100%" }} /></td>
                                    <td style={td}><input value={editForm.lastName} maxLength={100} onChange={(e) => set("lastName", e.target.value)} style={{ width: "100%" }} /></td>
                                    <td style={td}><input inputMode="numeric" maxLength={11} value={editForm.nationalNumber} onChange={(e) => set("nationalNumber", onlyDigits(e.target.value, 11))} style={{ width: "100%" }} /></td>
                                    <td style={td}>
                                        <select value={editForm.gender} onChange={(e) => set("gender", e.target.value)}>
                                            <option value="M">M</option>
                                            <option value="F">F</option>
                                        </select>
                                    </td>
                                    <td style={td}>
                                        <select value={editForm.customerType} onChange={(e) => set("customerType", Number(e.target.value) as 1 | 2)}>
                                            <option value={1}>Individual</option>
                                            <option value={2}>Corporate</option>
                                        </select>
                                    </td>
                                    <td style={td}>
                                        <select value={editForm.nationality} onChange={(e) => set("nationality", Number(e.target.value) as 1 | 2)}>
                                            <option value={1}>Citizen</option>
                                            <option value={2}>Foreign</option>
                                        </select>
                                    </td>
                                    <td style={td}><input type="number" min={0} max={150} value={editForm.age} onChange={(e) => set("age", Number(e.target.value))} style={{ width: 60 }} /></td>
                                    <td style={td}><input maxLength={150} value={editForm.bankBranch} onChange={(e) => set("bankBranch", e.target.value)} style={{ width: "100%" }} /></td>
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
                                <td style={td}>{row.data.firstName}</td>
                                <td style={td}>{row.data.lastName}</td>
                                <td style={td}>{row.data.nationalNumber}</td>
                                <td style={td}>{GENDER_LABEL[row.data.gender] ?? row.data.gender}</td>
                                <td style={td}>{TYPE_LABEL[row.data.customerType]}</td>
                                <td style={td}>{NAT_LABEL[row.data.nationality]}</td>
                                <td style={td}>{row.data.age}</td>
                                <td style={td}>{row.data.bankBranch}</td>
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
                            <td colSpan={11} style={{ ...td, textAlign: "center", color: "#999" }}>No customers yet.</td>
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
