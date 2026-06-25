import type { AccountRow, AccountType, Currency } from "../types/account";
import { authFetch, BASE_URL, getList, postBatch } from "./batch";

interface ApiAccount {
    id: number;
    customerId: number;
    accountNumber: string;
    accountType: AccountType;
    currency: Currency;
    balance: number;
    isActive: boolean;
}

function mapApiToRow(a: ApiAccount): AccountRow {
    return {
        id: a.id,
        status: "Unchanged",
        data: {
            customerId: a.customerId,
            accountNumber: a.accountNumber,
            accountType: a.accountType,
            currency: a.currency,
            balance: a.balance,
            isActive: a.isActive,
        },
    };
}

export const getAccountsByCustomer = (customerId: number) =>
    getList(`${BASE_URL}/api/accounts?customerId=${customerId}`, mapApiToRow);

export const saveAccountBatch = (rows: AccountRow[]) =>
    postBatch(`${BASE_URL}/api/accounts/batch`, rows, mapApiToRow);

export interface ReportFilters {
    branch?: string;
    currency?: Currency;
    accountType?: AccountType;
    isActive?: boolean;
    minBalance?: number;
}

export interface ReportRow {
    accountType: AccountType;
    currency: Currency;
    isActive: boolean;
    accountCount: number;
    totalBalance: number;
}

export async function getReport(filters: ReportFilters): Promise<ReportRow[]> {
    const params = new URLSearchParams();
    if (filters.branch) params.set("branch", filters.branch);
    if (filters.currency != null) params.set("currency", String(filters.currency));
    if (filters.accountType != null) params.set("accountType", String(filters.accountType));
    if (filters.isActive != null) params.set("isActive", String(filters.isActive));
    if (filters.minBalance != null) params.set("minBalance", String(filters.minBalance));

    const res = await authFetch(`${BASE_URL}/api/accounts/report?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to load report.");
    return res.json();
}
