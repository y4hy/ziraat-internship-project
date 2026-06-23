interface Props {
    saving: boolean;
    error: string | null;
    onSave: () => void;
}

export function SaveFooter({ saving, error, onSave }: Props) {
    return (
        <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "2px solid #ddd", padding: "12px 16px", display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={onSave} disabled={saving} style={{ padding: "8px 24px", fontSize: 15, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving…" : "Save"}
            </button>
            {error && (
                <pre style={{ color: "red", margin: 0, fontSize: 13, whiteSpace: "pre-wrap" }}>
                    {error}
                </pre>
            )}
        </div>
    );
}
