import type { Row } from "./row";

export type { RowStatus } from "./row";

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

export type CustomerRow = Row<CustomerData>;
