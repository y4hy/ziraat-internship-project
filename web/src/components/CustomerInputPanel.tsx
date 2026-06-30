import { useState } from "react";
import type { CustomerData } from "../types/customer";
import { BranchSearchModal } from "./BranchSearchModal";

interface Props {
    onAdd: (data: CustomerData) => void;
}

const empty: CustomerData = {
    firstName: "",
    lastName: "",
    nationalNumber: "",
    gender: "M",
    customerType: 1,
    nationality: 1,
    age: 0,
    bankBranch: "",
};

function isValidNationalId(number: string): boolean {
    if (number.length !== 11 || !/^\d+$/.test(number) || number[0] === "0") return false;
    const d = number.split("").map(Number);
    const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
    const evenSum = d[1] + d[3] + d[5] + d[7];
    if (((oddSum * 7) - evenSum) % 10 !== d[9]) return false;
    if (d.slice(0, 10).reduce((a, b) => a + b, 0) % 10 !== d[10]) return false;
    return true;
}

const onlyDigits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

function validateForm(data: CustomerData): string | null {
    if (!data.firstName.trim()) return "First name is required.";
    if (data.firstName.length > 150) return "First name exceeds 150 characters.";
    if (!data.lastName.trim()) return "Last name is required.";
    if (data.lastName.length > 100) return "Last name exceeds 100 characters.";

    if (data.customerType === 2) {
        if (!/^\d{8,10}$/.test(data.nationalNumber))
            return "Tax number must be 8–10 digits.";
    } else {
        if (!isValidNationalId(data.nationalNumber))
            return "National ID failed checksum validation.";
        if (data.nationality === 2 && !data.nationalNumber.startsWith("99"))
            return "Foreign national's ID must start with 99.";
    }

    if (data.age < 0 || data.age > 150) return "Age must be between 0 and 150.";
    if (!data.bankBranch.trim()) return "Bank branch is required.";
    return null;
}

export function CustomerInputPanel({ onAdd }: Props) {
    const [form, setForm] = useState<CustomerData>(empty);
    const [error, setError] = useState<string | null>(null);
    const [branchSearchOpen, setBranchSearchOpen] = useState(false);

    function set<K extends keyof CustomerData>(key: K, value: CustomerData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const err = validateForm(form);
        if (err) { setError(err); return; }
        setError(null);
        onAdd(form);
        setForm(empty);
    }

    return (
        <form onSubmit={handleSubmit} style={{ padding: "16px", background: "#f5f5f5", borderRadius: 8, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>Add Customer</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <label>
                    First Name
                    <input maxLength={150} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
                </label>
                <label>
                    Last Name
                    <input maxLength={100} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
                </label>
                <label>
                    National / Tax Number
                    <input inputMode="numeric" maxLength={11} value={form.nationalNumber} onChange={(e) => set("nationalNumber", onlyDigits(e.target.value, 11))} placeholder="11 digits (8–10 for tax)" required />
                </label>
                <label>
                    Gender
                    <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </select>
                </label>
                <label>
                    Customer Type
                    <select value={form.customerType} onChange={(e) => set("customerType", Number(e.target.value) as 1 | 2)}>
                        <option value={1}>Individual</option>
                        <option value={2}>Corporate</option>
                    </select>
                </label>
                <label>
                    Nationality
                    <select value={form.nationality} onChange={(e) => set("nationality", Number(e.target.value) as 1 | 2)}>
                        <option value={1}>Citizen</option>
                        <option value={2}>Foreign national</option>
                    </select>
                </label>
                <label>
                    Age
                    <input type="number" min={0} max={150} value={form.age} onChange={(e) => set("age", Number(e.target.value))} required />
                </label>
                <label>
                    Bank Branch
                    <span style={{ display: "flex", gap: 6 }}>
                        <input
                            value={form.bankBranch}
                            readOnly
                            required
                            placeholder="Select…"
                            onClick={() => setBranchSearchOpen(true)}
                            style={{ flex: 1, cursor: "pointer", background: "#fff" }}
                        />
                        <button type="button" onClick={() => setBranchSearchOpen(true)} aria-label="Search branch">🔍</button>
                    </span>
                </label>
            </div>
            {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
            <button type="submit" style={{ marginTop: 12 }}>Add to Grid</button>

            {branchSearchOpen && (
                <BranchSearchModal
                    onClose={() => setBranchSearchOpen(false)}
                    onSelect={(branch) => { set("bankBranch", branch); setBranchSearchOpen(false); }}
                />
            )}
        </form>
    );
}
