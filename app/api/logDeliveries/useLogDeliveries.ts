import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LogDeliveriesInput {
    auth_user_id: string;
    delivery_count: number;
    scanner_numbers: string[];
    delivery_date: string;
}

export function useLogDeliveries() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: LogDeliveriesInput) => {
            const res = await fetch("/api/logDeliveries/log-deliveries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to log deliveries");
            }

            return data;
        },

        // Auto refetch today's deliveries
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todays-deliveries"] });
        },
    });
}
