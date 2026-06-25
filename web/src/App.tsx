import { useEffect, useState } from "react";
import { clearToken, getToken, subscribe } from "./api/authStore";
import { LoginScreen } from "./components/LoginScreen";
import { Menu, type FormKey } from "./components/Menu";
import { CustomerOperationsForm } from "./components/CustomerOperationsForm";
import { AccountOperationsForm } from "./components/AccountOperationsForm";
import "./App.css";

function App() {
    const [token, setTokenState] = useState<string | null>(getToken());
    const [activeForm, setActiveForm] = useState<FormKey>("customer");

    // Keep React in sync with the token store (login, logout, and 401-triggered logout).
    useEffect(() => subscribe(() => setTokenState(getToken())), []);

    if (!token) {
        return <LoginScreen />;
    }

    return (
        <div style={{ width: "100%", padding: "24px 32px", boxSizing: "border-box", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <Menu active={activeForm} onSelect={setActiveForm} onLogout={clearToken} />
                <h1 style={{ margin: 0, fontSize: 22 }}>
                    {activeForm === "customer" ? "Customer Operations" : "Account Operations"}
                </h1>
            </div>

            {activeForm === "customer" ? <CustomerOperationsForm /> : <AccountOperationsForm />}
        </div>
    );
}

export default App;
