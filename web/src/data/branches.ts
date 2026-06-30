export interface Branch {
    code: string;
    name: string;
}

/** Canonical branch list. Branch values must come from here — they are not free text. */
export const BRANCHES: Branch[] = [
    { code: "10", name: "BÜSAN" },
    { code: "20", name: "KIZILAY" },
    { code: "30", name: "ÇANKAYA" },
    { code: "40", name: "KADIKÖY" },
    { code: "50", name: "BORNOVA" },
    { code: "60", name: "NİLÜFER" },
    { code: "70", name: "SELÇUKLU" },
    { code: "80", name: "MERKEZ" },
];
