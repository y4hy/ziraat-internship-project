import { useEffect, useState } from "react";
import { useRows } from "../hooks/useRows";
import { getAllCustomers, saveCustomerBatch } from "../api/customerApi";
import { getCountryCodes, getPhoneTypes, getProvinces } from "../api/lookupApi";
import type { Country, Province } from "../types/lookup";
import { CustomerInputPanel } from "./CustomerInputPanel";
import { CustomerGrid } from "./CustomerGrid";
import { SaveFooter } from "./SaveFooter";

export function CustomerOperationsTab() {
    const { rows, saving, saveError, loadInitial, addRow, updateRow, deleteRow, save } =
        useRows(getAllCustomers, saveCustomerBatch);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [phoneTypes, setPhoneTypes] = useState<string[]>([]);
    const [countryCodes, setCountryCodes] = useState<Country[]>([]);

    useEffect(() => {
        loadInitial();
        getProvinces().then(setProvinces).catch(() => setProvinces([]));
        getPhoneTypes().then(setPhoneTypes).catch(() => setPhoneTypes([]));
        getCountryCodes().then(setCountryCodes).catch(() => setCountryCodes([]));
    }, [loadInitial]);

    return (
        <>
            <h2 style={{ marginTop: 0 }}>Customer Transactions</h2>
            <CustomerInputPanel provinces={provinces} phoneTypes={phoneTypes} countryCodes={countryCodes} onAdd={addRow} />
            <CustomerGrid rows={rows} provinces={provinces} phoneTypes={phoneTypes} countryCodes={countryCodes} onUpdate={updateRow} onDelete={deleteRow} />
            <SaveFooter saving={saving} error={saveError} onSave={save} />
        </>
    );
}
