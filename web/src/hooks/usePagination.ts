import { useEffect, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;

/** Client-side pagination over an in-memory list. Clamps the page when the list shrinks. */
export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const pageItems = items.slice(startIndex, startIndex + pageSize);

    return { page: safePage, setPage, totalPages, pageItems, startIndex, pageSize };
}
