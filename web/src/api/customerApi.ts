import type { CustomerRow } from "../types/customer";
import { BASE_URL, getList, postBatch } from "./batch";

interface ApiCustomer {
    id: number;
    addressId: number | null;
    phoneId: number | null;
    firstName: string;
    lastName: string;
    nationalNumber: string;
    gender: string;
    customerType: 1 | 2;
    nationality: 1 | 2;
    age: number;
    bankBranch: string;
    province: string;
    district: string;
    openAddress: string;
    phoneType: string;
    countryCode: string;
    areaCode: string;
    phoneNumber: string;
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
            addressId: c.addressId,
            province: c.province,
            district: c.district,
            openAddress: c.openAddress,
            phoneId: c.phoneId,
            phoneType: c.phoneType,
            countryCode: c.countryCode,
            areaCode: c.areaCode,
            phoneNumber: c.phoneNumber,
        },
    };
}

export const getAllCustomers = () =>
    getList(`${BASE_URL}/api/customers`, mapApiToRow);

export const getCustomersByBranch = (branch: string) =>
    getList(`${BASE_URL}/api/customers?branch=${encodeURIComponent(branch)}`, mapApiToRow);

export const saveCustomerBatch = (rows: CustomerRow[]) =>
    postBatch(`${BASE_URL}/api/customers/batch`, rows, mapApiToRow);
