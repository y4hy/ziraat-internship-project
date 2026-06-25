export type TabKey = "operations" | "address" | "phone";

const TABS: { key: TabKey; label: string }[] = [
    { key: "operations", label: "Customer Operations" },
    { key: "address", label: "Customer Address" },
    { key: "phone", label: "Customer Phone" },
];

interface Props {
    active: TabKey;
    onChange: (key: TabKey) => void;
}

export function Tabs({ active, onChange }: Props) {
    return (
        <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #ddd", marginBottom: 16 }}>
            {TABS.map((tab) => {
                const isActive = tab.key === active;
                return (
                    <button
                        key={tab.key}
                        onClick={() => onChange(tab.key)}
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
    );
}
