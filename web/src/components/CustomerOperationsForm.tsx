import { useState } from "react";
import { Tabs, type TabKey } from "./Tabs";
import { CustomerOperationsTab } from "./CustomerOperationsTab";
import { AddressTab } from "./AddressTab";
import { PhoneTab } from "./PhoneTab";

export function CustomerOperationsForm() {
    const [active, setActive] = useState<TabKey>("operations");

    return (
        <>
            <Tabs active={active} onChange={setActive} />
            {/* Tabs stay mounted so each one keeps its unsaved rows when switching. */}
            <div hidden={active !== "operations"}><CustomerOperationsTab /></div>
            <div hidden={active !== "address"}><AddressTab /></div>
            <div hidden={active !== "phone"}><PhoneTab /></div>
        </>
    );
}
