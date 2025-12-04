import { useQuery } from "@tanstack/react-query";

interface TodaysDeliveriesResponse {
    delivery_count: number;
    scanner_numbers: string[];
}

export default function useGetTodaysDeliveries(auth_user_id?: string, date?: string) {
    return useQuery<TodaysDeliveriesResponse>({
        queryKey: ["todays-deliveries", auth_user_id, date],
        queryFn: async () => {
            if (!auth_user_id || !date) {
                return {
                    delivery_count: 0,
                    scanner_numbers: []
                };
            }

            const res = await fetch("/api/getTodaysDeliveries/get-todays-deliveries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    auth_user_id,
                    delivery_date: date,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch today's deliveries");
            }

            return data;
        },
        enabled: !!auth_user_id && !!date, // prevents query from running until we have a user
        refetchOnMount: true,
        refetchOnReconnect: true,
        staleTime: 1000 * 60, // 1 minute
    });
}
