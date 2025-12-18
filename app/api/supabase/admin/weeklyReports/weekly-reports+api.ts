import { startOfWeek, endOfWeek } from "date-fns";
import supabaseClient from "@/clients/supabase";
import * as XLSX from "xlsx";

/* ---------------------------------------
   Helpers
--------------------------------------- */
function getWeekStart(input: string) {
    const d = new Date(input);
    return startOfWeek(
        Number.isNaN(d.getTime()) ? new Date() : d,
        { weekStartsOn: 1 }
    );
}

function toExcel(rows: Record<string, any>[]) {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Weekly Payroll");

    return XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx",
    });
}

/* ---------------------------------------
   API Route
--------------------------------------- */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const weekStartParam = searchParams.get("weekStart"); // YYYY-MM-DD (Monday)

        if (!weekStartParam) {
            return new Response("Missing weekStart", { status: 400 });
        }

        const weekStart = getWeekStart(weekStartParam);
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

        const weekStartISO = weekStart.toISOString().slice(0, 10);
        const weekEndISO = weekEnd.toISOString().slice(0, 10);

        /* ---------------------------------------
           Query from deliveries (CORRECT ROOT)
        --------------------------------------- */
        const { data, error } = await supabaseClient
            .from("deliveries")
            .select(`
        delivery_date,
        drivers (
          full_name,
          email
        ),
        delivery_groups (
          delivery_group_scans (
            delivered_count
          )
        )
      `)
            .gte("delivery_date", weekStartISO)
            .lte("delivery_date", weekEndISO);

        if (error) {
            console.error(error);
            return new Response(error.message, { status: 500 });
        }

        if (!data || data.length === 0) {
            return new Response("No deliveries for this week", { status: 200 });
        }

        /* ---------------------------------------
           Aggregate totals per driver
        --------------------------------------- */
        const totals = new Map<string, any>();

        for (const delivery of data as any[]) {
            const driver = delivery.drivers;
            if (!driver?.email) continue;

            const deliveryTotal =
                delivery.delivery_groups?.reduce(
                    (groupSum: number, group: any) =>
                        groupSum +
                        group.delivery_group_scans.reduce(
                            (scanSum: number, scan: any) =>
                                scanSum + scan.delivered_count,
                            0
                        ),
                    0
                ) ?? 0;

            if (!totals.has(driver.email)) {
                totals.set(driver.email, {
                    driver_name: driver.full_name,
                    email: driver.email,
                    week_start: weekStartISO,
                    week_end: weekEndISO,
                    total_deliveries: 0,
                });
            }

            totals.get(driver.email).total_deliveries += deliveryTotal;
        }

        const rows = Array.from(totals.values());

        if (rows.length === 0) {
            return new Response("No payable deliveries", { status: 200 });
        }

        /* ---------------------------------------
           Excel Output
        --------------------------------------- */
        const buffer = toExcel(rows);

        return new Response(buffer, {
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition":
                    'attachment; filename="weekly_payroll_summary.xlsx"',
            },
        });
    } catch (err: any) {
        console.error(err);
        return new Response(err?.message ?? "Unexpected error", { status: 500 });
    }
}
