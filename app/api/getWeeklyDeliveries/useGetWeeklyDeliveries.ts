// hooks/deliveries/useGetWeeklyDeliveries.ts
import { useQuery } from "@tanstack/react-query";

async function fetchWeeklyDeliveries(clerkUserId: string) {
    const res = await fetch(
        `/api/getWeeklyDeliveries/get-weekly-deliveries?clerk_user_id=${clerkUserId}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Failed to fetch weekly deliveries");
    }

    return data.deliveries || [];
}

export function useGetWeeklyDeliveries(clerkUserId?: string) {
    return useQuery({
        queryKey: ["weekly-deliveries", clerkUserId],
        queryFn: () => fetchWeeklyDeliveries(clerkUserId!),
        enabled: !!clerkUserId, // runs only when userId is available
    });
}
