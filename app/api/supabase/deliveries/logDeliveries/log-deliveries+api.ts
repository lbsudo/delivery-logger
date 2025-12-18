import supabaseClient from "@/clients/supabase";

type GroupInput = {
    group_code: string;
    expected_count: number;
    scans: {
        scanner_code: string;
        delivered_count: number;
    }[];
};

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            clerk_auth_id,
            delivery_date,
            groups,
        }: {
            clerk_auth_id: string;
            delivery_date: string;
            groups: GroupInput[];
        } = body;

        if (!clerk_auth_id || !delivery_date || !groups?.length) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        /* ---------------------------------------------------
           1️⃣ Resolve Driver
        --------------------------------------------------- */

        const { data: driver, error: driverErr } = await supabaseClient
            .from("drivers")
            .select("id")
            .eq("clerk_auth_id", clerk_auth_id)
            .single();

        if (driverErr || !driver) {
            return Response.json(
                { error: "Driver not found" },
                { status: 404 }
            );
        }

        /* ---------------------------------------------------
           2️⃣ Create or Fetch Delivery (1 per day)
        --------------------------------------------------- */

        const { data: delivery, error: deliveryErr } = await supabaseClient
            .from("deliveries")
            .upsert(
                {
                    driver_id: driver.id,
                    delivery_date,
                },
                {
                    onConflict: "driver_id,delivery_date",
                }
            )
            .select("id")
            .single();

        if (deliveryErr || !delivery) {
            return Response.json(
                { error: deliveryErr?.message || "Failed to create delivery" },
                { status: 500 }
            );
        }

        /* ---------------------------------------------------
           3️⃣ 🔥 EDIT MODE LOGIC (DELETE FIRST)
           This prevents duplication and allows removal
        --------------------------------------------------- */

        const { error: deleteErr } = await supabaseClient
            .from("delivery_groups")
            .delete()
            .eq("delivery_id", delivery.id);

        if (deleteErr) {
            return Response.json(
                { error: deleteErr.message },
                { status: 500 }
            );
        }

        /* ---------------------------------------------------
           4️⃣ Reinsert Groups + Scans (fresh state)
        --------------------------------------------------- */

        for (const group of groups) {
            const { data: deliveryGroup, error: groupErr } =
                await supabaseClient
                    .from("delivery_groups")
                    .insert({
                        delivery_id: delivery.id,
                        group_code: group.group_code,
                        expected_count: group.expected_count,
                    })
                    .select("id")
                    .single();

            if (groupErr || !deliveryGroup) {
                return Response.json(
                    { error: groupErr?.message || "Failed to create delivery group" },
                    { status: 500 }
                );
            }

            for (const scan of group.scans) {
                const { data: scanner, error: scannerErr } =
                    await supabaseClient
                        .from("scanners")
                        .select("id")
                        .eq("scanner_code", scan.scanner_code)
                        .eq("active", true)
                        .single();

                if (scannerErr || !scanner) {
                    return Response.json(
                        { error: `Scanner not found: ${scan.scanner_code}` },
                        { status: 400 }
                    );
                }

                const { error: scanErr } = await supabaseClient
                    .from("delivery_group_scans")
                    .insert({
                        delivery_group_id: deliveryGroup.id,
                        scanner_id: scanner.id,
                        delivered_count: scan.delivered_count,
                    });

                if (scanErr) {
                    return Response.json(
                        { error: scanErr.message },
                        { status: 400 }
                    );
                }
            }
        }

        return Response.json({ success: true });
    } catch (err: any) {
        return Response.json(
            { error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
