import type { AddressRow } from "../types/address";
import { BASE_URL, getList, postBatch } from "./batch";

interface ApiAddress {
    id: number;
    customerId: number;
    province: string;
    district: string;
    openAddress: string;
    createdAt: string;
}

function mapApiToRow(a: ApiAddress): AddressRow {
    return {
        id: a.id,
        status: "Unchanged",
        data: {
            customerId: a.customerId,
            province: a.province,
            district: a.district,
            openAddress: a.openAddress,
        },
    };
}

export const getAllAddresses = () =>
    getList(`${BASE_URL}/api/addresses`, mapApiToRow);

export const saveAddressBatch = (rows: AddressRow[]) =>
    postBatch(`${BASE_URL}/api/addresses/batch`, rows, mapApiToRow);
