import { useState } from "react";
import { login } from "../api/authApi";
import { setToken } from "../api/authStore";

export function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const token = await login(username, password);
            setToken(token);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#f0f2f5" }}>
            <form onSubmit={handleSubmit} style={{ width: 340, padding: 32, background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                <h1 style={{ marginTop: 0, marginBottom: 24, fontSize: 22, textAlign: "center" }}>Customer Registration</h1>

                <label style={{ display: "block", marginBottom: 16 }}>
                    <span style={{ display: "block", marginBottom: 6, fontSize: 14, color: "#555" }}>Username</span>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                        required
                        style={inputStyle}
                    />
                </label>

                <label style={{ display: "block", marginBottom: 20 }}>
                    <span style={{ display: "block", marginBottom: 6, fontSize: 14, color: "#555" }}>Password</span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            style={{ padding: "0 12px", border: "1px solid #ccc", borderRadius: 6, background: "#fafafa", cursor: "pointer", fontSize: 16 }}
                        >
                            {showPassword ? "🙈" : "👁"}
                        </button>
                    </div>
                </label>

                {error && <p style={{ color: "red", margin: "0 0 16px", fontSize: 13 }}>{error}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    style={{ width: "100%", padding: "10px 0", fontSize: 15, background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, cursor: submitting ? "not-allowed" : "pointer" }}
                >
                    {submitting ? "Logging in…" : "Login"}
                </button>
            </form>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    fontSize: 14,
    border: "1px solid #ccc",
    borderRadius: 6,
    boxSizing: "border-box",
};
