// app/api/log-deliveries+api.ts
import supabaseClient from '@/clients/supabase';

export async function POST(req: Request) {
    try {
        const { auth_user_id, delivery_count, scanner_numbers, delivery_date } = await req.json();

        if (!auth_user_id || delivery_count == null) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Find the driver row using clerk_user_id
        const { data: driver, error: driverErr } = await supabaseClient
            .from('drivers')
            .select('id')
            .eq('clerk_user_id', auth_user_id)
            .single();

        if (driverErr || !driver) {
            return Response.json(
                { error: "Driver not found" },
                { status: 404 }
            );
        }

        // Insert one delivery row with delivery_count and scanner_numbers
        const { error: insertErr } = await supabaseClient
            .from('deliveries')
            .insert({
                driver_id: driver.id,
                delivery_date,
                delivery_count,
                scanner_numbers: scanner_numbers || [],
            });

        if (insertErr) {
            return Response.json(
                { error: insertErr.message },
                { status: 500 }
            );
        }

        return Response.json({ success: true });

    } catch (err: any) {
        return Response.json(
            { error: err.message },
            { status: 500 }
        );
    }
}