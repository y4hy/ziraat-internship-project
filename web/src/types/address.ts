import type { Row } from "./row";

export interface AddressData {
    customerId: number;
    province: string;
    district: string;
    openAddress: string;
}

export type AddressRow = Row<AddressData>;
