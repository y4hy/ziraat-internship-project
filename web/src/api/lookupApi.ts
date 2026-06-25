import type { Country, Province } from "../types/lookup";
import { BASE_URL } from "./batch";

async function getJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load lookup data.");
    return res.json();
}

export const getProvinces = () =>
    getJson<Province[]>(`${BASE_URL}/api/lookups/provinces`);

export const getPhoneTypes = () =>
    getJson<string[]>(`${BASE_URL}/api/lookups/phone-types`);

export const getCountryCodes = () =>
    getJson<Country[]>(`${BASE_URL}/api/lookups/country-codes`);
