import { useQuery } from "@tanstack/react-query";
import {todaySummaryKey} from "@/app/api/supabase/deliveries/todaySummary/todaySummary.keys";

export type TodayDeliverySummary =
    | {
    submitted: false;
    delivery_date: string;
}
    | {
    submitted: true;
    delivery_date: string;
    total_delivered: number;
    batches: {
        group_code: string;
        scanner_code: string;
        delivered_count: number;
    }[];
};

export function useTodaySummary(clerkAuthId: string) {
    return useQuery<TodayDeliverySummary>({
        queryKey: todaySummaryKey(clerkAuthId),
        enabled: !!clerkAuthId,
        staleTime: 0,
        refetchOnMount: "always",
        queryFn: async () => {
            const res = await fetch(
                `/api/supabase/deliveries/todaySummary/today-summary?clerk_auth_id=${encodeURIComponent(
                    clerkAuthId
                )}`
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to fetch summary");
            }

            return data;
        },
    });
}
