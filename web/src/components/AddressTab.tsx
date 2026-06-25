import { useEffect, useState } from "react";
import { useRows } from "../hooks/useRows";
import { getAllAddresses, saveAddressBatch } from "../api/addressApi";
import { getProvinces } from "../api/lookupApi";
import type { Province } from "../types/lookup";
import { AddressInputPanel } from "./AddressInputPanel";
import { AddressGrid } from "./AddressGrid";
import { SaveFooter } from "./SaveFooter";

export function AddressTab() {
    const { rows, saving, saveError, loadInitial, addRow, updateRow, deleteRow, save } =
        useRows(getAllAddresses, saveAddressBatch);
    const [provinces, setProvinces] = useState<Province[]>([]);

    useEffect(() => {
        loadInitial();
        getProvinces().then(setProvinces).catch(() => setProvinces([]));
    }, [loadInitial]);

    return (
        <>
            <AddressInputPanel provinces={provinces} onAdd={addRow} />
            <AddressGrid rows={rows} provinces={provinces} onUpdate={updateRow} onDelete={deleteRow} />
            <SaveFooter saving={saving} error={saveError} onSave={save} />
        </>
    );
}
