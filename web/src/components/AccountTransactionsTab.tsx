import { useCallback, useEffect, useState } from "react";
import { useRows } from "../hooks/useRows";
import { getAccountsByCustomer, saveAccountBatch } from "../api/accountApi";
import { getCustomersByBranch } from "../api/customerApi";
import { getBranches } from "../api/lookupApi";
import type { AccountData, AccountRow } from "../types/account";
import type { CustomerRow } from "../types/customer";
import { AccountGrid } from "./AccountGrid";
import { SaveFooter } from "./SaveFooter";

function emptyAccount(customerId: number): AccountData {
    return { customerId, accountNumber: "", accountType: 1, currency: 1, balance: 0, isActive: true };
}

export function AccountTransactionsTab() {
    const [branches, setBranches] = useState<string[]>([]);
    const [branch, setBranch] = useState("");
    const [customers, setCustomers] = useState<CustomerRow[]>([]);
    const [customerInput, setCustomerInput] = useState("");
    const [customerId, setCustomerId] = useState(0);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Seed a blank row when the customer has no accounts (per spec) so one can be created.
    const loadAccounts = useCallback(async (): Promise<AccountRow[]> => {
        if (customerId <= 0) return [];
        const fetched = await getAccountsByCustomer(customerId);
        return fetched.length ? fetched : [{ id: null, status: "Added", data: emptyAccount(customerId) }];
    }, [customerId]);

    const { rows, saving, saveError, loadInitial, addRow, updateRow, deleteRow, save } =
        useRows(loadAccounts, saveAccountBatch);

    useEffect(() => {
        getBranches().then(setBranches).catch(() => setBranches([]));
    }, []);

    useEffect(() => {
        if (customerId > 0) loadInitial();
    }, [customerId, loadInitial]);

    async function listByBranch() {
        setLoadError(null);
        if (!branch) { setLoadError("Select a customer branch first."); return; }
        try {
            setCustomers(await getCustomersByBranch(branch));
        } catch (err) {
            setLoadError(err instanceof Error ? err.message : "Failed to list customers.");
        }
    }

    function listAccounts(id: number) {
        const value = Number(id);
        if (!value || value <= 0) { setLoadError("Enter a valid customer number."); return; }
        setLoadError(null);
        setCustomerInput(String(value));
        setCustomerId(value);
    }

    return (
        <>
            <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8, marginBottom: 16 }}>
                <h2 style={{ marginTop: 0 }}>Customer Account Transactions</h2>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        Customer Number
                        <span style={{ display: "flex", gap: 8 }}>
                            <input
                                type="number"
                                min={1}
                                value={customerInput}
                                onChange={(e) => setCustomerInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") listAccounts(Number(customerInput)); }}
                            />
                            <button type="button" onClick={() => listAccounts(Number(customerInput))}>List Accounts</button>
                        </span>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        Customer Branch
                        <span style={{ display: "flex", gap: 8 }}>
                            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                                <option value="">Select…</option>
                                {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <button type="button" onClick={listByBranch}>List</button>
                        </span>
                    </label>
                </div>
                {loadError && <p style={{ color: "red", marginBottom: 0 }}>{loadError}</p>}
            </div>

            {customers.length > 0 && (
                <div style={{ overflowX: "auto", marginBottom: 16 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: "#e0e0e0" }}>
                                <th style={th}>ID</th>
                                <th style={th}>First Name</th>
                                <th style={th}>Last Name</th>
                                <th style={th}>National/Tax #</th>
                                <th style={th}>Branch</th>
                                <th style={th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c) => (
                                <tr key={c.id ?? undefined} style={{ background: c.id === customerId ? "#e3f2fd" : "white" }}>
                                    <td style={td}>{c.id}</td>
                                    <td style={td}>{c.data.firstName}</td>
                                    <td style={td}>{c.data.lastName}</td>
                                    <td style={td}>{c.data.nationalNumber}</td>
                                    <td style={td}>{c.data.bankBranch}</td>
                                    <td style={td}><button onClick={() => listAccounts(c.id ?? 0)}>Select</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {customerId > 0 && (
                <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h3 style={{ margin: 0 }}>Accounts for customer #{customerId}</h3>
                        <button onClick={() => addRow(emptyAccount(customerId))}>+ Add Account</button>
                    </div>
                    <AccountGrid rows={rows} onUpdate={updateRow} onDelete={deleteRow} />
                    <SaveFooter saving={saving} error={saveError} onSave={save} />
                </>
            )}
        </>
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
