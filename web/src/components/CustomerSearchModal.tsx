import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getAllCustomers, getCustomersByBranch } from "../api/customerApi";
import type { CustomerRow } from "../types/customer";
import { BranchSearchModal } from "./BranchSearchModal";

interface Props {
    onClose: () => void;
    onSelect: (customerId: number) => void;
}

type BranchMode = "branch" | "all";
type TypeFilter = "all" | "individual" | "corporate";

const PAGE_SIZE = 10;

const GENDER_LABEL: Record<string, string> = { M: "Male", F: "Female" };
const TYPE_LABEL: Record<number, string> = { 1: "Individual", 2: "Corporate" };
const NAT_LABEL: Record<number, string> = { 1: "Citizen", 2: "Foreign" };

interface Criteria {
    firstName: string;
    lastName: string;
    nationalId: string;
    taxNo: string;
    branchMode: BranchMode;
    branch: string;
    typeFilter: TypeFilter;
    nationality: "all" | "1" | "2";
}

const EMPTY: Criteria = {
    firstName: "",
    lastName: "",
    nationalId: "",
    taxNo: "",
    branchMode: "all",
    branch: "",
    typeFilter: "all",
    nationality: "all",
};

const contains = (value: string, term: string) =>
    !term.trim() || value.toLowerCase().includes(term.trim().toLowerCase());

function applyFilters(rows: CustomerRow[], c: Criteria): CustomerRow[] {
    return rows.filter((r) => {
        const d = r.data;
        if (!contains(d.firstName, c.firstName)) return false;
        if (!contains(d.lastName, c.lastName)) return false;
        if (c.nationalId.trim() && !(d.customerType === 1 && d.nationalNumber.includes(c.nationalId.trim()))) return false;
        if (c.taxNo.trim() && !(d.customerType === 2 && d.nationalNumber.includes(c.taxNo.trim()))) return false;
        if (c.typeFilter === "individual" && d.customerType !== 1) return false;
        if (c.typeFilter === "corporate" && d.customerType !== 2) return false;
        if (c.nationality !== "all" && String(d.nationality) !== c.nationality) return false;
        return true;
    });
}

export function CustomerSearchModal({ onClose, onSelect }: Props) {
    const [criteria, setCriteria] = useState<Criteria>(EMPTY);
    const [results, setResults] = useState<CustomerRow[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [branchSearchOpen, setBranchSearchOpen] = useState(false);

    function set<K extends keyof Criteria>(key: K, value: Criteria[K]) {
        setCriteria((prev) => ({ ...prev, [key]: value }));
    }

    const handleClear = useCallback(() => {
        setCriteria(EMPTY);
        setResults([]);
        setSearched(false);
        setError(null);
        setPage(1);
    }, []);

    const handleList = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const source = criteria.branchMode === "branch" && criteria.branch
                ? await getCustomersByBranch(criteria.branch)
                : await getAllCustomers();
            setResults(applyFilters(source, criteria));
            setSearched(true);
            setPage(1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to list customers.");
        } finally {
            setLoading(false);
        }
    }, [criteria]);

    // Wire the keyboard shortcuts advertised on the toolbar buttons.
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
            else if (e.key === "F8") { e.preventDefault(); handleClear(); }
            else if (e.key === "F9") { e.preventDefault(); handleList(); }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, handleClear, handleList]);

    const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
    const pageRows = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return createPortal(
        <div style={overlay} onMouseDown={onClose}>
            <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
                <button type="button" style={closeBtn} onClick={onClose} aria-label="Close">✕</button>

                <div style={toolbar}>
                    <button type="button" style={toolBtn} onClick={handleClear}>⟳ Clear (F8)</button>
                    <button type="button" style={toolBtn} onClick={handleList} disabled={loading}>
                        ☰ {loading ? "Listing…" : "List (F9)"}
                    </button>
                </div>

                <div style={body}>
                    <div style={sectionBar}>▦ Customer Information</div>

                    <div style={fieldBox}>
                        <Field label="Customer / Firm Name">
                            <input style={input} value={criteria.firstName} onChange={(e) => set("firstName", e.target.value)} />
                        </Field>
                        <Field label="Last Name">
                            <input style={input} value={criteria.lastName} onChange={(e) => set("lastName", e.target.value)} />
                        </Field>

                        <div style={divider} />

                        <Field label="National ID">
                            <input style={input} inputMode="numeric" value={criteria.nationalId} onChange={(e) => set("nationalId", e.target.value.replace(/\D/g, ""))} />
                        </Field>
                        <Field label="Tax No">
                            <input style={input} inputMode="numeric" value={criteria.taxNo} onChange={(e) => set("taxNo", e.target.value.replace(/\D/g, ""))} />
                        </Field>
                        <Field label="ATM / Credit Card">
                            <input style={{ ...input, background: "#ebebeb" }} disabled />
                        </Field>

                        <div style={divider} />

                        <div style={radioRow}>
                            <label style={radioLabel}>
                                <input type="radio" name="branchMode" checked={criteria.branchMode === "branch"} onChange={() => set("branchMode", "branch")} />
                                Branch
                            </label>
                            <input
                                style={{ ...input, flex: 1, opacity: criteria.branchMode === "branch" ? 1 : 0.5 }}
                                readOnly
                                placeholder="Select…"
                                value={criteria.branch}
                                onClick={() => criteria.branchMode === "branch" && setBranchSearchOpen(true)}
                            />
                            <button
                                type="button"
                                style={searchBtn}
                                disabled={criteria.branchMode !== "branch"}
                                onClick={() => setBranchSearchOpen(true)}
                                aria-label="Search branch"
                            >🔍</button>
                        </div>
                        <div style={radioRow}>
                            <label style={radioLabel}>
                                <input type="radio" name="branchMode" checked={criteria.branchMode === "all"} onChange={() => set("branchMode", "all")} />
                                All Branches
                            </label>
                        </div>

                        <div style={divider} />

                        <div style={radioRow}>
                            {(["all", "individual", "corporate"] as TypeFilter[]).map((t) => (
                                <label key={t} style={radioLabel}>
                                    <input type="radio" name="typeFilter" checked={criteria.typeFilter === t} onChange={() => set("typeFilter", t)} />
                                    {t === "all" ? "All" : t === "individual" ? "Individual" : "Corporate"}
                                </label>
                            ))}
                        </div>

                        <Field label="Nationality">
                            <select style={input} value={criteria.nationality} onChange={(e) => set("nationality", e.target.value as Criteria["nationality"])}>
                                <option value="all">All</option>
                                <option value="1">Citizen</option>
                                <option value="2">Foreign</option>
                            </select>
                        </Field>
                    </div>

                    <div style={{ ...sectionBar, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>▦ Customer Information</span>
                    </div>

                    <div style={gridToolbar}>
                        <span style={{ color: "#666" }}>{results.length} record{results.length === 1 ? "" : "s"}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button type="button" style={pageBtn} onClick={() => setPage(1)} disabled={page <= 1}>«</button>
                            <button type="button" style={pageBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>‹</button>
                            Page <strong>{page}</strong> / {totalPages}
                            <button type="button" style={pageBtn} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>›</button>
                            <button type="button" style={pageBtn} onClick={() => setPage(totalPages)} disabled={page >= totalPages}>»</button>
                        </span>
                    </div>

                    {error && <p style={{ color: "red", margin: "0 0 8px" }}>{error}</p>}

                    <div style={{ overflow: "auto", border: "1px solid #d0d7e2", maxHeight: 320 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: "#dfe6ef" }}>
                                    <th style={th}>Branch</th>
                                    <th style={th}>First Name</th>
                                    <th style={th}>Last Name</th>
                                    <th style={th}>National/Tax #</th>
                                    <th style={th}>Gender</th>
                                    <th style={th}>Type</th>
                                    <th style={th}>Nationality</th>
                                    <th style={th}>Age</th>
                                    <th style={th}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.map((r) => (
                                    <tr
                                        key={r.id ?? undefined}
                                        style={{ cursor: "pointer" }}
                                        onDoubleClick={() => r.id && onSelect(r.id)}
                                    >
                                        <td style={td}>{r.data.bankBranch}</td>
                                        <td style={td}>{r.data.firstName}</td>
                                        <td style={td}>{r.data.lastName}</td>
                                        <td style={td}>{r.data.nationalNumber}</td>
                                        <td style={td}>{GENDER_LABEL[r.data.gender] ?? r.data.gender}</td>
                                        <td style={td}>{TYPE_LABEL[r.data.customerType]}</td>
                                        <td style={td}>{NAT_LABEL[r.data.nationality]}</td>
                                        <td style={td}>{r.data.age}</td>
                                        <td style={td}>
                                            <button type="button" style={selectBtn} onClick={() => r.id && onSelect(r.id)}>Select</button>
                                        </td>
                                    </tr>
                                ))}
                                {searched && results.length === 0 && (
                                    <tr><td colSpan={9} style={{ ...td, textAlign: "center", color: "#999" }}>No customers found.</td></tr>
                                )}
                                {!searched && (
                                    <tr><td colSpan={9} style={{ ...td, textAlign: "center", color: "#999" }}>Enter criteria and press List (F9).</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {branchSearchOpen && (
                <BranchSearchModal
                    onClose={() => setBranchSearchOpen(false)}
                    onSelect={(branch) => { set("branch", branch); setBranchSearchOpen(false); }}
                />
            )}
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
    paddingTop: 40,
    zIndex: 1000,
};

const modal: React.CSSProperties = {
    position: "relative",
    width: 760,
    maxWidth: "95vw",
    maxHeight: "90vh",
    overflow: "auto",
    background: "#fff",
    border: "1px solid #c4ccd8",
    borderRadius: 4,
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
    fontFamily: "sans-serif",
};

const closeBtn: React.CSSProperties = {
    position: "absolute",
    top: 8,
    right: 10,
    border: "none",
    background: "transparent",
    color: "#c0392b",
    fontSize: 18,
    cursor: "pointer",
    lineHeight: 1,
};

const toolbar: React.CSSProperties = {
    display: "flex",
    gap: 8,
    padding: "12px 16px",
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

const body: React.CSSProperties = {
    padding: "0 16px 16px",
};

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

const fieldRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
};

const fieldLabel: React.CSSProperties = {
    width: 130,
    flexShrink: 0,
    fontSize: 13,
    color: "#333",
};

const input: React.CSSProperties = {
    flex: 1,
    border: "1px solid #cfd6df",
    borderRadius: 3,
    padding: "5px 8px",
    fontSize: 13,
    boxSizing: "border-box",
};

const divider: React.CSSProperties = {
    borderTop: "1px solid #e3e8ef",
    margin: "4px 0",
};

const radioRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
};

const radioLabel: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#333",
    width: 130,
    flexShrink: 0,
};

const gridToolbar: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #d0d7e2",
    borderTop: "none",
    padding: "6px 10px",
    fontSize: 13,
};

const pageBtn: React.CSSProperties = {
    border: "1px solid #cfd6df",
    background: "#fff",
    borderRadius: 3,
    padding: "0 8px",
    cursor: "pointer",
};

const searchBtn: React.CSSProperties = {
    border: "1px solid #cfd6df",
    background: "#fff",
    borderRadius: 3,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 13,
    flexShrink: 0,
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
