// app/api/syncDrivers/useSyncDriver.ts
import { useMutation } from "@tanstack/react-query";

interface SyncDriverPayload {
    auth_user_id: string;
    email: string | null | undefined;
    first_name: string;
    last_name: string;
}

async function syncDriverRequest(payload: SyncDriverPayload) {
    const res = await fetch("/api/syncDrivers/sync-drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Driver sync failed");
    }

    return data;
}

export default function useSyncDriver() {
    return useMutation({
        mutationFn: syncDriverRequest,
    });
}
