import { useState } from "react";
import type { AddressRow, AddressData } from "../types/address";
import type { Province } from "../types/lookup";

interface Props {
    rows: AddressRow[];
    provinces: Province[];
    onUpdate: (index: number, data: AddressData) => void;
    onDelete: (index: number) => void;
}

export function AddressGrid({ rows, provinces, onUpdate, onDelete }: Props) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<AddressData | null>(null);

    const editDistricts = provinces.find((p) => p.name === editForm?.province)?.districts ?? [];

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

    function set<K extends keyof AddressData>(key: K, value: AddressData[K]) {
        setEditForm((prev) => prev ? { ...prev, [key]: value } : prev);
    }

    return (
        <div style={{ overflowX: "auto", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                    <tr style={{ background: "#e0e0e0" }}>
                        <th style={th}>Status</th>
                        <th style={th}>ID</th>
                        <th style={th}>Customer #</th>
                        <th style={th}>Province</th>
                        <th style={th}>District</th>
                        <th style={th}>Open Address</th>
                        <th style={th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => {
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
                                    <td style={td}><input type="number" value={editForm.customerId || ""} onChange={(e) => set("customerId", Number(e.target.value))} style={{ width: 80 }} /></td>
                                    <td style={td}>
                                        <select value={editForm.province} onChange={(e) => setEditForm((prev) => prev ? { ...prev, province: e.target.value, district: "" } : prev)}>
                                            <option value="">Select…</option>
                                            {provinces.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                                        </select>
                                    </td>
                                    <td style={td}>
                                        <select value={editForm.district} onChange={(e) => set("district", e.target.value)} disabled={!editForm.province}>
                                            <option value="">Select…</option>
                                            {editDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </td>
                                    <td style={td}><input value={editForm.openAddress} maxLength={500} onChange={(e) => set("openAddress", e.target.value)} style={{ width: "100%" }} /></td>
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
                                <td style={td}>{row.data.customerId}</td>
                                <td style={td}>{row.data.province}</td>
                                <td style={td}>{row.data.district}</td>
                                <td style={td}>{row.data.openAddress}</td>
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
                            <td colSpan={7} style={{ ...td, textAlign: "center", color: "#999" }}>No addresses yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
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
