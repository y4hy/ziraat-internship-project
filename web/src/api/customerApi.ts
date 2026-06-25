import type { CustomerRow } from "../types/customer";
import { BASE_URL, getList, postBatch } from "./batch";

interface ApiCustomer {
    id: number;
    firstName: string;
    lastName: string;
    nationalNumber: string;
    gender: string;
    customerType: 1 | 2;
    nationality: 1 | 2;
    age: number;
    bankBranch: string;
    createdAt: string;
}

function mapApiToRow(c: ApiCustomer): CustomerRow {
    return {
        id: c.id,
        status: "Unchanged",
        data: {
            firstName: c.firstName,
            lastName: c.lastName,
            nationalNumber: c.nationalNumber,
            gender: c.gender,
            customerType: c.customerType,
            nationality: c.nationality,
            age: c.age,
            bankBranch: c.bankBranch,
        },
    };
}

export const getAllCustomers = () =>
    getList(`${BASE_URL}/api/customers`, mapApiToRow);

export const saveCustomerBatch = (rows: CustomerRow[]) =>
    postBatch(`${BASE_URL}/api/customers/batch`, rows, mapApiToRow);
