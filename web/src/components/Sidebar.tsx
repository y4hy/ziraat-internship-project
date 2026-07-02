import { useState } from "react";

export type ScreenKey = "customer" | "account-transactions" | "account-report";

interface SubTab {
    key: ScreenKey;
    label: string;
}

interface NavItem {
    key: string;
    label: string;
    screen?: ScreenKey;
    subTabs?: SubTab[];
}

const ITEMS: NavItem[] = [
    { key: "customer", label: "Customer Operations", screen: "customer" },
    {
        key: "account",
        label: "Account Operations",
        subTabs: [
            { key: "account-transactions", label: "Customer Account Transactions" },
            { key: "account-report", label: "Customer Account Report" },
        ],
    },
];

function containsActive(item: NavItem, active: ScreenKey): boolean {
    return item.screen === active || (item.subTabs?.some((s) => s.key === active) ?? false);
}

interface Props {
    active: ScreenKey;
    onSelect: (key: ScreenKey) => void;
    onLogout: () => void;
}

export function Sidebar({ active, onSelect, onLogout }: Props) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(ITEMS.map((item) => [item.key, containsActive(item, active)]))
    );

    function handleTopClick(item: NavItem) {
        if (item.screen) onSelect(item.screen);
        if (item.subTabs) setExpanded((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
    }

    return (
        <aside style={sidebarStyle}>
            <div style={brandStyle}>Ziraat Bank</div>
            <nav style={{ flex: 1, overflowY: "auto", padding: 8 }}>
                {ITEMS.map((item) => {
                    const isDirectlyActive = item.screen === active;
                    const isExpanded = expanded[item.key];
                    return (
                        <div key={item.key} style={{ marginBottom: 4 }}>
                            <button onClick={() => handleTopClick(item)} style={topItemStyle(isDirectlyActive, containsActive(item, active))}>
                                <span>{item.label}</span>
                                {item.subTabs && (
                                    <span
                                        style={{
                                            display: "inline-block",
                                            transform: isExpanded ? "rotate(180deg)" : "none",
                                            transition: "transform 0.15s",
                                        }}
                                    >
                                        ▾
                                    </span>
                                )}
                            </button>
                            {item.subTabs && isExpanded && (
                                <div style={{ marginTop: 2 }}>
                                    {item.subTabs.map((sub) => (
                                        <button key={sub.key} onClick={() => onSelect(sub.key)} style={subItemStyle(sub.key === active)}>
                                            {sub.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
            <div style={{ padding: 8, borderTop: "1px solid #eee" }}>
                <button onClick={onLogout} style={{ ...topItemStyle(false, false), color: "#c62828" }}>Logout</button>
            </div>
        </aside>
    );
}

const sidebarStyle: React.CSSProperties = {
    width: 260,
    flexShrink: 0,
    background: "#fafbfc",
    borderRight: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
};

const brandStyle: React.CSSProperties = {
    padding: "18px 20px",
    fontSize: 17,
    fontWeight: 700,
    color: "#1976d2",
    borderBottom: "1px solid #eee",
};

function topItemStyle(directlyActive: boolean, containsActiveChild: boolean): React.CSSProperties {
    return {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        border: "none",
        borderRadius: 6,
        background: directlyActive ? "#e3f2fd" : "transparent",
        color: directlyActive || containsActiveChild ? "#1976d2" : "#333",
        fontWeight: directlyActive || containsActiveChild ? 700 : 500,
        fontSize: 14,
        cursor: "pointer",
    };
}

function subItemStyle(active: boolean): React.CSSProperties {
    return {
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "8px 12px 8px 28px",
        border: "none",
        borderRadius: 6,
        background: active ? "#e3f2fd" : "transparent",
        color: active ? "#1976d2" : "#555",
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        cursor: "pointer",
    };
}
