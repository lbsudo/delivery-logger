import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todaySummaryKey } from "@/app/api/supabase/deliveries/todaySummary/todaySummary.keys";

/* ---------------------------------------------------
   Types (mirrors API contract)
--------------------------------------------------- */

export type DeliveryGroupInput = {
    group_code: string;
    expected_count: number;
    scans: {
        scanner_code: string;
        delivered_count: number;
    }[];
};

export type LogDeliveriesInput = {
    clerk_auth_id: string;
    delivery_date: string; // YYYY-MM-DD
    groups: DeliveryGroupInput[];
};

export type LogDeliveriesResponse = { success: true } | { error: string };

/* ---------------------------------------------------
   Mutation Hook (typed + cache refresh)
--------------------------------------------------- */

export function useLogDeliveries() {
    const queryClient = useQueryClient();

    return useMutation<LogDeliveriesResponse, Error, LogDeliveriesInput>({
        mutationFn: async (payload: LogDeliveriesInput) => {
            const res = await fetch(
                "/api/supabase/deliveries/logDeliveries/log-deliveries",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const text = await res.text();

            let data: unknown;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(`Invalid JSON response: ${text}`);
            }

            if (!res.ok) {
                const err =
                    typeof data === "object" &&
                    data !== null &&
                    "error" in data &&
                    typeof (data as any).error === "string"
                        ? (data as any).error
                        : "Save failed";

                throw new Error(err);
            }

            return data as LogDeliveriesResponse;
        },

        onSuccess: (_data, variables) => {
            // ✅ variables is now LogDeliveriesInput (NOT void)
            queryClient.invalidateQueries({
                queryKey: todaySummaryKey(variables.clerk_auth_id),
            });

            // Optional: force immediate refresh
            queryClient.refetchQueries({
                queryKey: todaySummaryKey(variables.clerk_auth_id),
            });
        },
    });
}
