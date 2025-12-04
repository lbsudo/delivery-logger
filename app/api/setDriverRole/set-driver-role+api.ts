// app/api/setDriverRole/set-driver-role+api.ts

import {clerkClient} from "@/clients/clerk";

export async function POST(req: Request) {
    try {
        const { clerk_user_id } = await req.json();

        if (!clerk_user_id) {
            return Response.json(
                { error: "Missing clerk_user_id" },
                { status: 400 }
            );
        }

        // Fetch the user first
        const user = await clerkClient.users.getUser(clerk_user_id);
        const currentRole = user.publicMetadata?.role;

        // If role already exists, do nothing
        if (currentRole) {
            return Response.json(
                { status: "unchanged", role: currentRole },
                { status: 200 }
            );
        }

        // Update role to driver
        const updated = await clerkClient.users.updateUser(clerk_user_id, {
            publicMetadata: { role: "driver" },
        });

        return Response.json(
            {
                status: "updated",
                role: updated.publicMetadata.role,
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("❌ Failed to update driver role:", err);
        return Response.json(
            { error: err.message ?? "Unknown error" },
            { status: 500 }
        );
    }
}
