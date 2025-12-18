import supabaseClient from "@/clients/supabase";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clerkAuthId = searchParams.get("clerk_auth_id");

        if (!clerkAuthId) {
            return Response.json(
                { error: "Missing clerk_auth_id" },
                { status: 400 }
            );
        }

        const today = new Date().toISOString().slice(0, 10);

        /* ---------------------------------------------------
           1️⃣ Resolve Driver
        --------------------------------------------------- */

        const { data: driver, error: driverErr } = await supabaseClient
            .from("drivers")
            .select("id")
            .eq("clerk_auth_id", clerkAuthId)
            .single();

        if (driverErr || !driver) {
            return Response.json(
                { error: "Driver not found" },
                { status: 404 }
            );
        }

        /* ---------------------------------------------------
           2️⃣ Fetch Today’s Delivery (deep join)
        --------------------------------------------------- */

        const { data: delivery, error: deliveryErr } = await supabaseClient
            .from("deliveries")
            .select(
                `
        id,
        delivery_groups (
          group_code,
          delivery_group_scans (
            delivered_count,
            scanners (
              scanner_code
            )
          )
        )
        `
            )
            .eq("driver_id", driver.id)
            .eq("delivery_date", today)
            .maybeSingle();

        if (deliveryErr) {
            return Response.json(
                { error: deliveryErr.message },
                { status: 500 }
            );
        }

        if (!delivery) {
            return Response.json({
                submitted: false,
                delivery_date: today,
            });
        }

        /* ---------------------------------------------------
           3️⃣ Aggregate summary + batches
        --------------------------------------------------- */

        let totalDelivered = 0;
        const groupCodes = new Set<string>();
        const scannersUsed = new Set<string>();

        const batches: {
            group_code: string;
            scanner_code: string;
            delivered_count: number;
        }[] = [];

        const groups = (delivery as any).delivery_groups ?? [];

        for (const group of groups) {
            const groupCode = group?.group_code;
            if (!groupCode) continue;

            groupCodes.add(groupCode);

            const scans = group?.delivery_group_scans ?? [];
            for (const scan of scans) {
                const count = Number(scan?.delivered_count ?? 0);
                totalDelivered += count;

                const scannersRel = scan?.scanners;
                const scannerObj = Array.isArray(scannersRel)
                    ? scannersRel[0]
                    : scannersRel;

                const scannerCode = scannerObj?.scanner_code;
                if (!scannerCode) continue;

                scannersUsed.add(scannerCode);

                batches.push({
                    group_code: groupCode,
                    scanner_code: scannerCode,
                    delivered_count: count,
                });
            }
        }

        return Response.json({
            submitted: true,
            delivery_date: today,
            total_delivered: totalDelivered,
            groups: Array.from(groupCodes),
            scanners: Array.from(scannersUsed),
            batches, // ✅ REQUIRED FOR EDIT MODE
        });
    } catch (err: any) {
        return Response.json(
            { error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
