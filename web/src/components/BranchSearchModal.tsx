import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getProvinces } from "../api/lookupApi";
import type { Province } from "../types/lookup";
import { BRANCHES, type Branch } from "../data/branches";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "./Pagination";

interface Props {
    onClose: () => void;
    onSelect: (branch: string) => void;
}

interface Criteria {
    code: string;
    name: string;
    province: string;
    district: string;
    allBranches: boolean;
}

const EMPTY: Criteria = { code: "", name: "", province: "", district: "", allBranches: false };

const contains = (value: string, term: string) =>
    !term.trim() || value.toLowerCase().includes(term.trim().toLowerCase());

export function BranchSearchModal({ onClose, onSelect }: Props) {
    const [criteria, setCriteria] = useState<Criteria>(EMPTY);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [results, setResults] = useState<Branch[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { page, setPage, totalPages, pageItems } = usePagination(results);

    function set<K extends keyof Criteria>(key: K, value: Criteria[K]) {
        setCriteria((prev) => ({ ...prev, [key]: value }));
    }

    useEffect(() => {
        getProvinces().then(setProvinces).catch(() => setProvinces([]));
    }, []);

    const districts = provinces.find((p) => p.name === criteria.province)?.districts ?? [];

    const handleClear = useCallback(() => {
        setCriteria(EMPTY);
        setResults([]);
        setSearched(false);
        setError(null);
    }, []);

    const handleList = useCallback(() => {
        setError(null);
        setLoading(true);
        try {
            const filtered = criteria.allBranches
                ? BRANCHES
                : BRANCHES.filter((b) => contains(b.code, criteria.code) && contains(b.name, criteria.name));
            setResults(filtered);
            setSearched(true);
            setPage(1);
        } finally {
            setLoading(false);
        }
    }, [criteria, setPage]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
            else if (e.key === "F8") { e.preventDefault(); handleClear(); }
            else if (e.key === "F9") { e.preventDefault(); handleList(); }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, handleClear, handleList]);

    return createPortal(
        <div style={overlay} onMouseDown={onClose}>
            <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
                <div style={titleBar}>
                    <span>Branch Search</span>
                    <button type="button" style={closeBtn} onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div style={toolbar}>
                    <button type="button" style={toolBtn} onClick={handleList} disabled={loading}>
                        ☰ {loading ? "Listing…" : "List (F9)"}
                    </button>
                    <button type="button" style={toolBtn} onClick={handleClear}>⟳ Clear (F8)</button>
                </div>

                <div style={body}>
                    <div style={fieldBox}>
                        <Field label="Branch Code">
                            <input style={input} value={criteria.code} disabled={criteria.allBranches} onChange={(e) => set("code", e.target.value)} />
                        </Field>
                        <Field label="Branch Name">
                            <input style={input} value={criteria.name} disabled={criteria.allBranches} onChange={(e) => set("name", e.target.value)} />
                        </Field>
                        <Field label="Province">
                            <select style={{ ...input, background: "#ebebeb" }} value={criteria.province} disabled onChange={(e) => set("province", e.target.value)}>
                                <option value="">—</option>
                                {provinces.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                            </select>
                        </Field>
                        <Field label="District">
                            <select style={{ ...input, background: "#ebebeb" }} value={criteria.district} disabled onChange={(e) => set("district", e.target.value)}>
                                <option value="">—</option>
                                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </Field>
                        <Field label="All Branches">
                            <input type="checkbox" checked={criteria.allBranches} onChange={(e) => set("allBranches", e.target.checked)} />
                        </Field>
                    </div>

                    <div style={sectionBar}>▦ Branch List</div>

                    {error && <p style={{ color: "red", margin: "8px 0 0" }}>{error}</p>}

                    <div style={{ overflow: "auto", border: "1px solid #d0d7e2", borderTop: "none", maxHeight: 320 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: "#dfe6ef" }}>
                                    <th style={th}>Branch Code</th>
                                    <th style={th}>Branch Name</th>
                                    <th style={th}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map((b) => (
                                    <tr key={b.code} style={{ cursor: "pointer" }} onDoubleClick={() => onSelect(b.name)}>
                                        <td style={td}>{b.code}</td>
                                        <td style={td}>{b.name}</td>
                                        <td style={td}>
                                            <button type="button" style={selectBtn} onClick={() => onSelect(b.name)}>Select</button>
                                        </td>
                                    </tr>
                                ))}
                                {searched && results.length === 0 && (
                                    <tr><td colSpan={3} style={{ ...td, textAlign: "center", color: "#999" }}>No branches found.</td></tr>
                                )}
                                {!searched && (
                                    <tr><td colSpan={3} style={{ ...td, textAlign: "center", color: "#999" }}>Enter criteria and press List (F9).</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {results.length > 0 && (
                        <Pagination page={page} totalPages={totalPages} totalItems={results.length} onPage={setPage} />
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={fieldRow}>
            <span style={fieldLabel}>{label}</span>
            {children}
        </div>
    );
}

const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 60,
    zIndex: 1100,
};

const modal: React.CSSProperties = {
    position: "relative",
    width: 680,
    maxWidth: "95vw",
    maxHeight: "85vh",
    overflow: "auto",
    background: "#fff",
    border: "1px solid #c4ccd8",
    borderRadius: 4,
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
    fontFamily: "sans-serif",
};

const titleBar: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #e3e8ef",
    color: "#34587a",
    fontWeight: 600,
    fontSize: 14,
};

const closeBtn: React.CSSProperties = {
    border: "none",
    background: "transparent",
    color: "#c0392b",
    fontSize: 16,
    cursor: "pointer",
    lineHeight: 1,
};

const toolbar: React.CSSProperties = {
    display: "flex",
    gap: 8,
    padding: "12px 16px 0",
};

const toolBtn: React.CSSProperties = {
    background: "#4a90c2",
    color: "#fff",
    border: "1px solid #3f7da8",
    borderRadius: 4,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
};

const body: React.CSSProperties = { padding: 16 };

const sectionBar: React.CSSProperties = {
    background: "#eef1f5",
    border: "1px solid #d0d7e2",
    color: "#34587a",
    fontWeight: 600,
    fontSize: 13,
    padding: "6px 10px",
    marginBottom: -1,
};

const fieldBox: React.CSSProperties = {
    border: "1px solid #d0d7e2",
    padding: "10px 12px",
    marginBottom: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
};

const fieldRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8 };

const fieldLabel: React.CSSProperties = { width: 110, flexShrink: 0, fontSize: 13, color: "#333" };

const input: React.CSSProperties = {
    flex: 1,
    border: "1px solid #cfd6df",
    borderRadius: 3,
    padding: "5px 8px",
    fontSize: 13,
    boxSizing: "border-box",
};

const selectBtn: React.CSSProperties = {
    background: "#4a90c2",
    color: "#fff",
    border: "none",
    borderRadius: 3,
    padding: "3px 10px",
    cursor: "pointer",
    fontSize: 12,
};

const th: React.CSSProperties = {
    padding: "7px 10px",
    textAlign: "left",
    borderBottom: "1px solid #c4ccd8",
    whiteSpace: "nowrap",
    color: "#34587a",
    position: "sticky",
    top: 0,
    background: "#dfe6ef",
};

const td: React.CSSProperties = {
    padding: "6px 10px",
    borderBottom: "1px solid #eee",
    whiteSpace: "nowrap",
};
