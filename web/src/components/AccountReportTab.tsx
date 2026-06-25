import { useEffect, useState } from "react";
import { getReport, type ReportFilters, type ReportRow } from "../api/accountApi";
import { getBranches } from "../api/lookupApi";
import {
    type AccountType,
    type Currency,
    ACCOUNT_TYPES,
    CURRENCIES,
    ACCOUNT_TYPE_LABEL,
    CURRENCY_LABEL,
} from "../types/account";

export function AccountReportTab() {
    const [branches, setBranches] = useState<string[]>([]);
    const [branch, setBranch] = useState("");
    const [currency, setCurrency] = useState("");
    const [accountType, setAccountType] = useState("");
    const [activeStatus, setActiveStatus] = useState("");
    const [minBalance, setMinBalance] = useState("");

    const [report, setReport] = useState<ReportRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getBranches().then(setBranches).catch(() => setBranches([]));
    }, []);

    async function runReport() {
        setLoading(true);
        setError(null);
        const filters: ReportFilters = {};
        if (branch) filters.branch = branch;
        if (currency) filters.currency = Number(currency) as Currency;
        if (accountType) filters.accountType = Number(accountType) as AccountType;
        if (activeStatus) filters.isActive = activeStatus === "true";
        if (minBalance.trim() !== "") filters.minBalance = Number(minBalance);

        try {
            setReport(await getReport(filters));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to run report.");
        } finally {
            setLoading(false);
        }
    }

    const grandTotal = report?.reduce((sum, r) => sum + r.totalBalance, 0) ?? 0;

    return (
        <>
            <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8, marginBottom: 16 }}>
                <h2 style={{ marginTop: 0 }}>Customer Account Report</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                    <label style={col}>
                        Customer Branch
                        <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                            <option value="">All</option>
                            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </label>
                    <label style={col}>
                        Account Currency
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                            <option value="">All</option>
                            {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </label>
                    <label style={col}>
                        Account Type
                        <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                            <option value="">All</option>
                            {ACCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </label>
                    <label style={col}>
                        Active Status
                        <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
                            <option value="">All</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </label>
                    <label style={col}>
                        Account Balance &gt;
                        <input type="number" min={0} step="0.01" value={minBalance} onChange={(e) => setMinBalance(e.target.value)} />
                    </label>
                </div>
                <button onClick={runReport} disabled={loading} style={{ marginTop: 12, padding: "8px 24px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer" }}>
                    {loading ? "Running…" : "Report"}
                </button>
                {error && <p style={{ color: "red", marginBottom: 0 }}>{error}</p>}
            </div>

            {report && (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: "#e0e0e0" }}>
                                <th style={th}>Account Type</th>
                                <th style={th}>Currency</th>
                                <th style={th}>Active Status</th>
                                <th style={th}>Account Count</th>
                                <th style={th}>Total Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.map((r, i) => (
                                <tr key={i}>
                                    <td style={td}>{ACCOUNT_TYPE_LABEL[r.accountType]}</td>
                                    <td style={td}>{CURRENCY_LABEL[r.currency]}</td>
                                    <td style={td}>{r.isActive ? "Yes" : "No"}</td>
                                    <td style={td}>{r.accountCount}</td>
                                    <td style={td}>{r.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                            {report.length === 0 && (
                                <tr><td colSpan={5} style={{ ...td, textAlign: "center", color: "#999" }}>No accounts match the selected filters.</td></tr>
                            )}
                        </tbody>
                        {report.length > 0 && (
                            <tfoot>
                                <tr style={{ background: "#f5f5f5", fontWeight: 700 }}>
                                    <td style={td} colSpan={4}>Grand Total</td>
                                    <td style={td}>{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </>
    );
}

const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 14 };

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
