// app/api/setDriverRole/useSetDriverRole.ts
import { useMutation } from "@tanstack/react-query";

export default function useSetDriverRole() {
    return useMutation({
        mutationFn: async (clerk_user_id: string) => {
            const res = await fetch("/api/clerk/setDriverRole/set-driver-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clerk_user_id }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to set driver role");

            return data;
        },
    });
}
