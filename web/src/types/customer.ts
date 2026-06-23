export type RowStatus = "Added" | "Modified" | "Deleted" | "Unchanged";

export interface CustomerData {
    firstName: string;
    lastName: string;
    nationalNumber: string;
    gender: string;
    customerType: 1 | 2;
    nationality: 1 | 2;
    age: number;
    bankBranch: string;
}

export interface CustomerRow {
    id: number | null;
    status: RowStatus;
    data: CustomerData;
}
