import type { PhoneRow } from "../types/phone";
import { BASE_URL, getList, postBatch } from "./batch";

interface ApiPhone {
    id: number;
    customerId: number;
    phoneType: string;
    countryCode: string;
    areaCode: string;
    phoneNumber: string;
    createdAt: string;
}

function mapApiToRow(p: ApiPhone): PhoneRow {
    return {
        id: p.id,
        status: "Unchanged",
        data: {
            customerId: p.customerId,
            phoneType: p.phoneType,
            countryCode: p.countryCode,
            areaCode: p.areaCode,
            phoneNumber: p.phoneNumber,
        },
    };
}

export const getAllPhones = () =>
    getList(`${BASE_URL}/api/phones`, mapApiToRow);

export const savePhoneBatch = (rows: PhoneRow[]) =>
    postBatch(`${BASE_URL}/api/phones/batch`, rows, mapApiToRow);
