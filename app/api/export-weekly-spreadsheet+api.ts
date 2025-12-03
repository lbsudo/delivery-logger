import ExcelJS from "exceljs";
import supabaseClient from "@/clients/supabase";
import { addDays } from "date-fns";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const weekStart = url.searchParams.get("week_start");

        if (!weekStart) {
            return new Response(
                JSON.stringify({ error: "Missing week_start query parameter" }),
                { status: 400 }
            );
        }

        const start = new Date(weekStart);
        const end = addDays(start, 6);
        const weekStartStr = start.toISOString().slice(0, 10);
        const weekEndStr = end.toISOString().slice(0, 10);

        // Fetch drivers
        const { data: drivers, error: driverErr } = await supabaseClient
            .from("drivers")
            .select("*");

        if (driverErr) {
            return new Response(JSON.stringify({ error: driverErr.message }), { status: 500 });
        }

        // Fetch deliveries for selected week
        const { data: deliveries, error: delErr } = await supabaseClient
            .from("deliveries")
            .select("driver_id, delivery_date")
            .gte("delivery_date", weekStartStr)
            .lte("delivery_date", weekEndStr);

        if (delErr) {
            return new Response(JSON.stringify({ error: delErr.message }), { status: 500 });
        }

        // Aggregate totals
        const totals: Record<string, number> = {};
        deliveries?.forEach((d) => {
            totals[d.driver_id] = (totals[d.driver_id] || 0) + 1;
        });

        // Build Excel file
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Weekly Deliveries");

        sheet.addRow(["Driver Name", "Email", "Total Deliveries"]).eachCell((cell) => {
            cell.font = { bold: true };
        });

        drivers?.forEach((driver) => {
            const total = totals[driver.id] ?? 0;
            const name = `${driver.first_name ?? ""} ${driver.last_name ?? ""}`.trim();
            sheet.addRow([name, driver.email, total]);
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition":
                    `attachment; filename="weekly-deliveries-${weekStartStr}-to-${weekEndStr}.xlsx"`,
            },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
