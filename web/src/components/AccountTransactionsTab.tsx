import { useCallback, useEffect, useState } from "react";
import { useRows } from "../hooks/useRows";
import { getAccountsByCustomer, saveAccountBatch } from "../api/accountApi";
import type { AccountData, AccountRow } from "../types/account";
import { AccountGrid } from "./AccountGrid";
import { CustomerSearchModal } from "./CustomerSearchModal";
import { SaveFooter } from "./SaveFooter";

function emptyAccount(customerId: number): AccountData {
    return { customerId, accountNumber: "", accountType: 1, currency: 1, balance: 0, isActive: true };
}

export function AccountTransactionsTab() {
    const [customerId, setCustomerId] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);

    // Seed a blank row when the customer has no accounts (per spec) so one can be created.
    const loadAccounts = useCallback(async (): Promise<AccountRow[]> => {
        if (customerId <= 0) return [];
        const fetched = await getAccountsByCustomer(customerId);
        return fetched.length ? fetched : [{ id: null, status: "Added", data: emptyAccount(customerId) }];
    }, [customerId]);

    const { rows, saving, saveError, loadInitial, addRow, updateRow, deleteRow, save } =
        useRows(loadAccounts, saveAccountBatch);

    useEffect(() => {
        if (customerId > 0) loadInitial();
    }, [customerId, loadInitial]);

    function selectCustomer(id: number) {
        setSearchOpen(false);
        setCustomerId(id);
    }

    return (
        <>
            <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8, marginBottom: 16 }}>
                <h2 style={{ marginTop: 0 }}>Customer Account Transactions</h2>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button type="button" onClick={() => setSearchOpen(true)}>🔍 Search Customer…</button>
                    {customerId > 0 && <span style={{ color: "#555" }}>Selected customer #{customerId}</span>}
                </div>
            </div>

            {searchOpen && (
                <CustomerSearchModal onClose={() => setSearchOpen(false)} onSelect={selectCustomer} />
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
