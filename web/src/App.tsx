import { useEffect } from "react";
import { useCustomerRows } from "./hooks/useCustomerRows";
import { CustomerInputPanel } from "./components/CustomerInputPanel";
import { CustomerGrid } from "./components/CustomerGrid";
import { SaveFooter } from "./components/SaveFooter";
import "./App.css";

function App() {
    const { rows, saving, saveError, loadInitial, addRow, updateRow, deleteRow, save } = useCustomerRows();

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" }}>
            <h1 style={{ marginTop: 0 }}>Customer Registration</h1>
            <CustomerInputPanel onAdd={addRow} />
            <CustomerGrid rows={rows} onUpdate={updateRow} onDelete={deleteRow} />
            <SaveFooter saving={saving} error={saveError} onSave={save} />
        </div>
    );
}

export default App;
