import { AccountTransactionsTab } from "./AccountTransactionsTab";
import { AccountReportTab } from "./AccountReportTab";

export type AccountTabKey = "transactions" | "report";

interface Props {
    activeTab: AccountTabKey;
}

export function AccountOperationsForm({ activeTab }: Props) {
    return (
        <>
            {/* Both stay mounted so each one keeps its unsaved rows when switching. */}
            <div hidden={activeTab !== "transactions"}><AccountTransactionsTab /></div>
            <div hidden={activeTab !== "report"}><AccountReportTab /></div>
        </>
    );
}
