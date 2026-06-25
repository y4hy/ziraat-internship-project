import { useState } from "react";
import { AccountTransactionsTab } from "./AccountTransactionsTab";
import { AccountReportTab } from "./AccountReportTab";

type AccountTabKey = "transactions" | "report";

const TABS: { key: AccountTabKey; label: string }[] = [
    { key: "transactions", label: "Customer Account Transactions" },
    { key: "report", label: "Customer Account Report" },
];

export function AccountOperationsForm() {
    const [active, setActive] = useState<AccountTabKey>("transactions");

    return (
        <>
            <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #ddd", marginBottom: 16 }}>
                {TABS.map((tab) => {
                    const isActive = tab.key === active;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActive(tab.key)}
                            style={{
                                padding: "10px 20px",
                                border: "none",
                                borderBottom: isActive ? "3px solid #1976d2" : "3px solid transparent",
                                background: "transparent",
                                fontSize: 15,
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? "#1976d2" : "#555",
                                marginBottom: -2,
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            <div hidden={active !== "transactions"}><AccountTransactionsTab /></div>
            <div hidden={active !== "report"}><AccountReportTab /></div>
        </>
    );
}
