import { useState } from "react";

export type FormKey = "customer" | "account";

const ITEMS: { key: FormKey; label: string }[] = [
    { key: "customer", label: "Customer Operations" },
    { key: "account", label: "Account Operations" },
];

interface Props {
    active: FormKey;
    onSelect: (key: FormKey) => void;
    onLogout: () => void;
}

export function Menu({ active, onSelect, onLogout }: Props) {
    const [open, setOpen] = useState(false);

    function choose(key: FormKey) {
        onSelect(key);
        setOpen(false);
    }

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <button
                onClick={() => setOpen((v) => !v)}
                style={{ padding: "8px 16px", fontSize: 15, background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
            >
                ☰ Menu
            </button>

            {open && (
                <>
                    {/* Click-away backdrop closes the list. */}
                    <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1 }} />
                    <ul style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, padding: 4, listStyle: "none", background: "#fff", border: "1px solid #ddd", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", minWidth: 200, zIndex: 2 }}>
                        {ITEMS.map((item) => (
                            <li key={item.key}>
                                <button onClick={() => choose(item.key)} style={itemStyle(item.key === active)}>
                                    {item.label}
                                </button>
                            </li>
                        ))}
                        <li><hr style={{ border: "none", borderTop: "1px solid #eee", margin: "4px 0" }} /></li>
                        <li>
                            <button onClick={onLogout} style={{ ...itemStyle(false), color: "#c62828" }}>Logout</button>
                        </li>
                    </ul>
                </>
            )}
        </div>
    );
}

function itemStyle(active: boolean): React.CSSProperties {
    return {
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        border: "none",
        borderRadius: 6,
        background: active ? "#e3f2fd" : "transparent",
        color: active ? "#1976d2" : "#333",
        fontWeight: active ? 700 : 500,
        fontSize: 14,
        cursor: "pointer",
    };
}
