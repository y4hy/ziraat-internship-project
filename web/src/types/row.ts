export type RowStatus = "Added" | "Modified" | "Deleted" | "Unchanged";

export interface Row<TData> {
    id: number | null;
    status: RowStatus;
    data: TData;
}
