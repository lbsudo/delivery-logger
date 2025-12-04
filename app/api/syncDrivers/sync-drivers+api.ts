import supabaseClient from "@/clients/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { auth_user_id, email, first_name, last_name } = body;

        if (!auth_user_id || !email) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const name = `${first_name || ""} ${last_name || ""}`.trim() || "Unknown";

        // Check if driver exists
        const { data: existing, error: findErr } = await supabaseClient
            .from("drivers")
            .select("*")
            .eq("clerk_user_id", auth_user_id)
            .maybeSingle();

        if (findErr) {
            return Response.json(
                { error: findErr.message },
                { status: 500 }
            );
        }

        if (existing) {
            // Update existing driver's info
            const { data: updated, error: updateErr } = await supabaseClient
                .from("drivers")
                .update({
                    name,
                    email,
                })
                .eq("clerk_user_id", auth_user_id)
                .select()
                .single();

            if (updateErr) {
                return Response.json(
                    { error: updateErr.message },
                    { status: 500 }
                );
            }

            return Response.json(
                {
                    status: "updated",
                    driver: updated,
                },
                { status: 200 }
            );
        }

        // Create new driver
        const { data: created, error: insertErr } = await supabaseClient
            .from("drivers")
            .insert([
                {
                    clerk_user_id: auth_user_id,
                    name,
                    email,
                },
            ])
            .select()
            .single();

        if (insertErr) {
            return Response.json(
                { error: insertErr.message },
                { status: 500 }
            );
        }

        return Response.json(
            {
                status: "created",
                driver: created,
            },
            { status: 200 }
        );

    } catch (err: any) {
        return Response.json(
            { error: err.message ?? "Unknown error" },
            { status: 500 }
        );
    }
}