interface Props {
    page: number;
    totalPages: number;
    totalItems: number;
    onPage: (page: number) => void;
}

/** Shared page navigator used under every data table. */
export function Pagination({ page, totalPages, totalItems, onPage }: Props) {
    return (
        <div style={bar}>
            <span style={{ color: "#666" }}>{totalItems} record{totalItems === 1 ? "" : "s"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button type="button" style={btn} onClick={() => onPage(1)} disabled={page <= 1}>«</button>
                <button type="button" style={btn} onClick={() => onPage(page - 1)} disabled={page <= 1}>‹</button>
                <span>Page <strong>{page}</strong> / {totalPages}</span>
                <button type="button" style={btn} onClick={() => onPage(page + 1)} disabled={page >= totalPages}>›</button>
                <button type="button" style={btn} onClick={() => onPage(totalPages)} disabled={page >= totalPages}>»</button>
            </span>
        </div>
    );
}

const bar: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 4px",
    fontSize: 13,
};

const btn: React.CSSProperties = {
    border: "1px solid #cfd6df",
    background: "#fff",
    borderRadius: 3,
    padding: "2px 9px",
    cursor: "pointer",
    lineHeight: 1.4,
};
