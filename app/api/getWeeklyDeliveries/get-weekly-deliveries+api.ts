// app/api/get-weekly-deliveries+api.ts
import supabaseClient from "@/clients/supabase";
import { startOfWeek, endOfWeek } from "date-fns";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clerkUserId = searchParams.get("clerk_user_id");

        if (!clerkUserId) {
            return Response.json({ error: "Missing clerk_user_id" }, { status: 400 });
        }

        // 1️⃣ Find driver by Clerk user ID
        const { data: driver, error: driverErr } = await supabaseClient
            .from("drivers")
            .select("*")
            .eq("clerk_user_id", clerkUserId)
            .maybeSingle();

        if (driverErr) {
            return Response.json({ error: driverErr.message }, { status: 500 });
        }

        if (!driver) {
            return Response.json({ error: "Driver not found" }, { status: 404 });
        }

        // 2️⃣ Compute current week (Mon → Sun)
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

        // 3️⃣ Get deliveries for this week
        const { data: deliveries, error: delivErr } = await supabaseClient
            .from("deliveries")
            .select("*")
            .eq("driver_id", driver.id)
            .gte("delivery_date", weekStart.toISOString().slice(0, 10))
            .lte("delivery_date", weekEnd.toISOString().slice(0, 10))
            .order("delivery_date", { ascending: true });

        if (delivErr) {
            return Response.json({ error: delivErr.message }, { status: 500 });
        }

        return Response.json(
            {
                driver: {
                    id: driver.id,
                    name: driver.name,
                    email: driver.email,
                },
                deliveries,
                week_start: weekStart.toISOString().slice(0, 10),
                week_end: weekEnd.toISOString().slice(0, 10),
            },
            { status: 200 }
        );
    } catch (err: any) {
        return Response.json(
            { error: err.message || "Unknown error" },
            { status: 500 }
        );
    }
}
