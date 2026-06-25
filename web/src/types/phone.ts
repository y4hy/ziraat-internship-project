import type { Row } from "./row";

export interface PhoneData {
    customerId: number;
    phoneType: string;
    countryCode: string;
    areaCode: string;
    phoneNumber: string;
}

export type PhoneRow = Row<PhoneData>;
