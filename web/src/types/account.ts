import type { Row } from "./row";

export type { RowStatus } from "./row";

export type AccountType = 1 | 2; // 1 = Time Deposit, 2 = Demand Deposit
export type Currency = 1 | 2 | 3; // 1 = TL, 2 = USD, 3 = EUR

export interface AccountData {
    customerId: number;
    accountNumber: string;
    accountType: AccountType;
    currency: Currency;
    balance: number;
    isActive: boolean;
}

export type AccountRow = Row<AccountData>;

// Fixed reference data for the Account combo boxes (mirrors the backend byte codes).
export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
    { value: 1, label: "Time Deposit" },
    { value: 2, label: "Demand Deposit" },
];

export const CURRENCIES: { value: Currency; label: string }[] = [
    { value: 1, label: "TL" },
    { value: 2, label: "USD" },
    { value: 3, label: "EUR" },
];

export const ACCOUNT_TYPE_LABEL: Record<number, string> = { 1: "Time Deposit", 2: "Demand Deposit" };
export const CURRENCY_LABEL: Record<number, string> = { 1: "TL", 2: "USD", 3: "EUR" };
