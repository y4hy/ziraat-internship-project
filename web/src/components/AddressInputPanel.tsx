import { useState } from "react";
import type { AddressData } from "../types/address";
import type { Province } from "../types/lookup";

interface Props {
    provinces: Province[];
    onAdd: (data: AddressData) => void;
}

const empty: AddressData = {
    customerId: 0,
    province: "",
    district: "",
    openAddress: "",
};

function validateAddress(data: AddressData): string | null {
    if (!data.customerId || data.customerId <= 0) return "Customer number is required.";
    if (!data.province) return "Province is required.";
    if (!data.district) return "District is required.";
    if (!data.openAddress.trim()) return "Open address is required.";
    return null;
}

export function AddressInputPanel({ provinces, onAdd }: Props) {
    const [form, setForm] = useState<AddressData>(empty);
    const [error, setError] = useState<string | null>(null);

    const districts = provinces.find((p) => p.name === form.province)?.districts ?? [];

    function set<K extends keyof AddressData>(key: K, value: AddressData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const err = validateAddress(form);
        if (err) { setError(err); return; }
        setError(null);
        onAdd(form);
        setForm(empty);
    }

    return (
        <form onSubmit={handleSubmit} style={{ padding: "16px", background: "#f5f5f5", borderRadius: 8, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>Add Address</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                <label>
                    Customer Number
                    <input type="number" min={1} value={form.customerId || ""} onChange={(e) => set("customerId", Number(e.target.value))} required />
                </label>
                <label>
                    Province (İl)
                    <select value={form.province} onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value, district: "" }))} required>
                        <option value="">Select…</option>
                        {provinces.map((p) => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    District (İlçe)
                    <select value={form.district} onChange={(e) => set("district", e.target.value)} disabled={!form.province} required>
                        <option value="">Select…</option>
                        {districts.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Open Address
                    <input value={form.openAddress} maxLength={500} onChange={(e) => set("openAddress", e.target.value)} required />
                </label>
            </div>
            {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
            <button type="submit" style={{ marginTop: 12 }}>Add to Grid</button>
        </form>
    );
}
