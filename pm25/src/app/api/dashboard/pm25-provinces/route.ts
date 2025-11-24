// app/api/dashboard/pm25-provinces/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { parseFilters, buildWhere } from "@/lib/pm25Filters";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const f = parseFilters(req.url);
        const where = buildWhere(f);

        const data = await prisma.pm25_daily.groupBy({
            by: ["province"],
            _avg: { pm25: true },
            where,
        });

        const out = data
            .filter(x => x.province)
            .map(x => ({ province: x.province!, avgPm25: Number(x._avg.pm25 ?? 0) }))
            .sort((a, b) => a.province.localeCompare(b.province, "th-TH"));

        return NextResponse.json(out);
    } catch (err) {
        console.error("[pm25-provinces] ERROR:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
