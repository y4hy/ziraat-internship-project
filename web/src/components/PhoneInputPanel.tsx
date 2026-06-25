import { useState } from "react";
import type { PhoneData } from "../types/phone";
import type { Country } from "../types/lookup";

interface Props {
    phoneTypes: string[];
    countryCodes: Country[];
    onAdd: (data: PhoneData) => void;
}

const empty: PhoneData = {
    customerId: 0,
    phoneType: "",
    countryCode: "",
    areaCode: "",
    phoneNumber: "",
};

function validatePhone(data: PhoneData): string | null {
    if (!data.customerId || data.customerId <= 0) return "Customer number is required.";
    if (!data.phoneType) return "Phone type is required.";
    if (!data.countryCode) return "Country code is required.";
    if (!/^\d{3}$/.test(data.areaCode)) return "Area code must be 3 digits.";
    if (!/^\d{7}$/.test(data.phoneNumber)) return "Phone number must be 7 digits.";
    return null;
}

const onlyDigits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

export function PhoneInputPanel({ phoneTypes, countryCodes, onAdd }: Props) {
    const [form, setForm] = useState<PhoneData>(empty);
    const [error, setError] = useState<string | null>(null);

    function set<K extends keyof PhoneData>(key: K, value: PhoneData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const err = validatePhone(form);
        if (err) { setError(err); return; }
        setError(null);
        onAdd(form);
        setForm(empty);
    }

    return (
        <form onSubmit={handleSubmit} style={{ padding: "16px", background: "#f5f5f5", borderRadius: 8, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>Add Phone</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "12px" }}>
                <label>
                    Customer Number
                    <input type="number" min={1} value={form.customerId || ""} onChange={(e) => set("customerId", Number(e.target.value))} required />
                </label>
                <label>
                    Phone Type
                    <select value={form.phoneType} onChange={(e) => set("phoneType", e.target.value)} required>
                        <option value="">Select…</option>
                        {phoneTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </label>
                <label>
                    Country Code
                    <select value={form.countryCode} onChange={(e) => set("countryCode", e.target.value)} required>
                        <option value="">Select…</option>
                        {countryCodes.map((c) => <option key={c.code} value={c.code}>{c.code} – {c.name}</option>)}
                    </select>
                </label>
                <label>
                    Area Code
                    <input inputMode="numeric" value={form.areaCode} onChange={(e) => set("areaCode", onlyDigits(e.target.value, 3))} placeholder="3 digits" required />
                </label>
                <label>
                    Phone Number
                    <input inputMode="numeric" value={form.phoneNumber} onChange={(e) => set("phoneNumber", onlyDigits(e.target.value, 7))} placeholder="7 digits" required />
                </label>
            </div>
            {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
            <button type="submit" style={{ marginTop: 12 }}>Add to Grid</button>
        </form>
    );
}
