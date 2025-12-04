// app/api/update-deliveries+api.ts
import supabaseClient from "@/clients/supabase";

export async function POST(req: Request) {
    try {
        const { auth_user_id, delivery_count, scanner_numbers, delivery_date } = await req.json();

        if (!auth_user_id || delivery_count == null) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get driver record
        const { data: driver, error: driverErr } = await supabaseClient
            .from("drivers")
            .select("id")
            .eq("clerk_user_id", auth_user_id)
            .single();

        if (driverErr || !driver) {
            return Response.json({ error: "Driver not found" }, { status: 404 });
        }

        // Update the delivery_count and scanner_numbers for this driver and date
        const { error: updateErr } = await supabaseClient
            .from("deliveries")
            .update({
                delivery_count,
                scanner_numbers: scanner_numbers || []
            })
            .eq("driver_id", driver.id)
            .eq("delivery_date", delivery_date);

        if (updateErr) {
            return Response.json(
                { error: updateErr.message },
                { status: 500 }
            );
        }

        return Response.json({ success: true }, { status: 200 });

    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}