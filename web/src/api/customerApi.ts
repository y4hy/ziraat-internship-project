import type { CustomerRow, CustomerData } from "../types/customer";

const BASE_URL = "http://localhost:5118";

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

export async function getAllCustomers(): Promise<CustomerRow[]> {
    const res = await fetch(`${BASE_URL}/api/customers`);
    if (!res.ok) throw new Error("Failed to load customers.");
    const data: ApiCustomer[] = await res.json();
    return data.map(mapApiToRow);
}

export async function saveBatch(rows: CustomerRow[]): Promise<CustomerRow[]> {
    const body = {
        rows: rows.map((r) => ({
            id: r.id,
            rowStatus: r.status,
            data: {
                firstName: r.data.firstName,
                lastName: r.data.lastName,
                nationalNumber: r.data.nationalNumber,
                gender: r.data.gender,
                customerType: r.data.customerType,
                nationality: r.data.nationality,
                age: r.data.age,
                bankBranch: r.data.bankBranch,
            } as CustomerData,
        })),
    };

    const res = await fetch(`${BASE_URL}/api/customers/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const messages: string[] = [];
        if (payload?.errors) {
            for (const [key, msg] of Object.entries(payload.errors)) {
                messages.push(`[${key}]: ${msg}`);
            }
        }
        throw new Error(messages.length ? messages.join("\n") : "Save failed.");
    }

    const data: ApiCustomer[] = await res.json();
    return data.map(mapApiToRow);
}
