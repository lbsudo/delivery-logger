import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateDeliveriesInput {
    auth_user_id: string;
    delivery_count: number;
    scanner_numbers: string[];
    delivery_date: string;
}

export function useUpdateDeliveries() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateDeliveriesInput) => {
            const res = await fetch("/api/updateDeliveries/update-deliveries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update deliveries");
            }

            return data;
        },

        // Automatically refresh today's deliveries
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todays-deliveries"] });
        },
    });
}
