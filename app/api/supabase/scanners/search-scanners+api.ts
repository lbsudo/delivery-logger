import supabaseClient from "@/clients/supabase";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q")?.trim();

        if (!q || q.length < 1) {
            return Response.json({ scanners: [] });
        }

        const { data, error } = await supabaseClient
            .from("scanners")
            .select("scanner_code")
            .ilike("scanner_code", `%${q}%`)
            .eq("active", true)
            .limit(10);

        if (error) {
            return Response.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return Response.json({
            scanners: data.map((s) => s.scanner_code),
        });
    } catch (err: any) {
        return Response.json(
            { error: err.message },
            { status: 500 }
        );
    }
}
