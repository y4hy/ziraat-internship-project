import { useState } from "react";
import { Tabs, type TabKey } from "./components/Tabs";
import { CustomerOperationsTab } from "./components/CustomerOperationsTab";
import { AddressTab } from "./components/AddressTab";
import { PhoneTab } from "./components/PhoneTab";
import "./App.css";

function App() {
    const [active, setActive] = useState<TabKey>("operations");

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" }}>
            <h1 style={{ marginTop: 0 }}>Customer Registration</h1>
            <Tabs active={active} onChange={setActive} />
            {/* Tabs stay mounted so each one keeps its unsaved rows when switching. */}
            <div hidden={active !== "operations"}><CustomerOperationsTab /></div>
            <div hidden={active !== "address"}><AddressTab /></div>
            <div hidden={active !== "phone"}><PhoneTab /></div>
        </div>
    );
}

export default App;
