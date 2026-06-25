import { useState } from "react";
import type { PhoneRow, PhoneData } from "../types/phone";
import type { Country } from "../types/lookup";

interface Props {
    rows: PhoneRow[];
    phoneTypes: string[];
    countryCodes: Country[];
    onUpdate: (index: number, data: PhoneData) => void;
    onDelete: (index: number) => void;
}

const onlyDigits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

export function PhoneGrid({ rows, phoneTypes, countryCodes, onUpdate, onDelete }: Props) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<PhoneData | null>(null);

    const countryLabel = (code: string) => {
        const c = countryCodes.find((x) => x.code === code);
        return c ? `${c.code} – ${c.name}` : code;
    };

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

    function set<K extends keyof PhoneData>(key: K, value: PhoneData[K]) {
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
                        <th style={th}>Phone Type</th>
                        <th style={th}>Country Code</th>
                        <th style={th}>Area Code</th>
                        <th style={th}>Phone Number</th>
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
                                        <select value={editForm.phoneType} onChange={(e) => set("phoneType", e.target.value)}>
                                            <option value="">Select…</option>
                                            {phoneTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </td>
                                    <td style={td}>
                                        <select value={editForm.countryCode} onChange={(e) => set("countryCode", e.target.value)}>
                                            <option value="">Select…</option>
                                            {countryCodes.map((c) => <option key={c.code} value={c.code}>{c.code} – {c.name}</option>)}
                                        </select>
                                    </td>
                                    <td style={td}><input inputMode="numeric" value={editForm.areaCode} onChange={(e) => set("areaCode", onlyDigits(e.target.value, 3))} style={{ width: 60 }} /></td>
                                    <td style={td}><input inputMode="numeric" value={editForm.phoneNumber} onChange={(e) => set("phoneNumber", onlyDigits(e.target.value, 7))} style={{ width: 90 }} /></td>
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
                                <td style={td}>{row.data.phoneType}</td>
                                <td style={td}>{countryLabel(row.data.countryCode)}</td>
                                <td style={td}>{row.data.areaCode}</td>
                                <td style={td}>{row.data.phoneNumber}</td>
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
                            <td colSpan={8} style={{ ...td, textAlign: "center", color: "#999" }}>No phones yet.</td>
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
