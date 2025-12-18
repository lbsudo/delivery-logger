import { useQuery } from "@tanstack/react-query";

/* ---------------------------------------
   Types
--------------------------------------- */

export type SearchScannersResponse = {
    scanners: string[];
};

/* ---------------------------------------
   Hook
--------------------------------------- */

export function useSearchScanners(query: string) {
    return useQuery<SearchScannersResponse, Error>({
        queryKey: ["scanners", "search", query],
        enabled: query.length > 0, // only run when typing
        queryFn: async () => {
            const res = await fetch(
                `/api/supabase/scanners/search-scanners?q=${encodeURIComponent(query)}`
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to fetch scanners");
            }

            return res.json();
        },
        staleTime: 30_000, // cache results briefly
        retry: 1,
    });
}
