import { useEffect, useState } from "react";
import { clearToken, getToken, subscribe } from "./api/authStore";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar, type ScreenKey } from "./components/Sidebar";
import { CustomerOperationsForm } from "./components/CustomerOperationsForm";
import { AccountOperationsForm } from "./components/AccountOperationsForm";
import "./App.css";

const PAGE_TITLES: Record<ScreenKey, string> = {
    customer: "Customer Operations",
    "account-transactions": "Customer Account Transactions",
    "account-report": "Customer Account Report",
};

function App() {
    const [token, setTokenState] = useState<string | null>(getToken());
    const [active, setActive] = useState<ScreenKey>("customer");

    // Keep React in sync with the token store (login, logout, and 401-triggered logout).
    useEffect(() => subscribe(() => setTokenState(getToken())), []);

    if (!token) {
        return <LoginScreen />;
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
            <Sidebar active={active} onSelect={setActive} onLogout={clearToken} />
            <div style={{ flex: 1, minWidth: 0, padding: "24px 32px", boxSizing: "border-box" }}>
                <h1 style={{ margin: "0 0 16px", fontSize: 22 }}>{PAGE_TITLES[active]}</h1>

                {active === "customer" ? (
                    <CustomerOperationsForm />
                ) : (
                    <AccountOperationsForm activeTab={active === "account-report" ? "report" : "transactions"} />
                )}
            </div>
        </div>
    );
}

export default App;
