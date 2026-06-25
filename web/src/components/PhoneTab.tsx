import { useEffect, useState } from "react";
import { useRows } from "../hooks/useRows";
import { getAllPhones, savePhoneBatch } from "../api/phoneApi";
import { getCountryCodes, getPhoneTypes } from "../api/lookupApi";
import type { Country } from "../types/lookup";
import { PhoneInputPanel } from "./PhoneInputPanel";
import { PhoneGrid } from "./PhoneGrid";
import { SaveFooter } from "./SaveFooter";

export function PhoneTab() {
    const { rows, saving, saveError, loadInitial, addRow, updateRow, deleteRow, save } =
        useRows(getAllPhones, savePhoneBatch);
    const [phoneTypes, setPhoneTypes] = useState<string[]>([]);
    const [countryCodes, setCountryCodes] = useState<Country[]>([]);

    useEffect(() => {
        loadInitial();
        getPhoneTypes().then(setPhoneTypes).catch(() => setPhoneTypes([]));
        getCountryCodes().then(setCountryCodes).catch(() => setCountryCodes([]));
    }, [loadInitial]);

    return (
        <>
            <PhoneInputPanel phoneTypes={phoneTypes} countryCodes={countryCodes} onAdd={addRow} />
            <PhoneGrid rows={rows} phoneTypes={phoneTypes} countryCodes={countryCodes} onUpdate={updateRow} onDelete={deleteRow} />
            <SaveFooter saving={saving} error={saveError} onSave={save} />
        </>
    );
}
