// app/api/get-todays-deliveries+api.ts
import supabaseClient from "@/clients/supabase";

export async function POST(req: Request) {
    try {
        const { auth_user_id, delivery_date } = await req.json();

        // Get the driver row
        const { data: driver, error: driverErr } = await supabaseClient
            .from("drivers")
            .select("id")
            .eq("clerk_user_id", auth_user_id)
            .single();

        if (driverErr || !driver) {
            return Response.json({ error: "Driver not found" }, { status: 404 });
        }

        // Get today's delivery record
        const { data: delivery, error } = await supabaseClient
            .from("deliveries")
            .select("delivery_count, scanner_numbers")
            .eq("driver_id", driver.id)
            .eq("delivery_date", delivery_date)
            .maybeSingle();

        if (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }

        // If no delivery found, return count 0
        if (!delivery) {
            return Response.json({
                delivery_count: 0,
                scanner_numbers: []
            }, { status: 200 });
        }

        return Response.json({
            delivery_count: delivery.delivery_count,
            scanner_numbers: delivery.scanner_numbers
        }, { status: 200 });

    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}