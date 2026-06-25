import { useEffect } from "react";
import { useRows } from "../hooks/useRows";
import { getAllCustomers, saveCustomerBatch } from "../api/customerApi";
import { CustomerInputPanel } from "./CustomerInputPanel";
import { CustomerGrid } from "./CustomerGrid";
import { SaveFooter } from "./SaveFooter";

export function CustomerOperationsTab() {
    const { rows, saving, saveError, loadInitial, addRow, updateRow, deleteRow, save } =
        useRows(getAllCustomers, saveCustomerBatch);

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    return (
        <>
            <CustomerInputPanel onAdd={addRow} />
            <CustomerGrid rows={rows} onUpdate={updateRow} onDelete={deleteRow} />
            <SaveFooter saving={saving} error={saveError} onSave={save} />
        </>
    );
}
