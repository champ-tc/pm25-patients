// app/api/dashboard/pm25-patients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFilters, buildWhere, startOfWeek } from "@/lib/pm25Filters";

type SeriesRow = {
    date: Date;
    pm25: number | null;
    province: string | null;
    district: string | null;
    subdistrict: string | null;
};

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const f = parseFilters(req.url);
        const where = buildWhere(f);
        const granularity = f.granularity?.toLowerCase() === "day" ? "day" : "week";

        const [rows, avgAgg] = await Promise.all([
            prisma.pm25_daily.findMany({
                where,
                orderBy: { date: "asc" },
                select: { date: true, pm25: true, province: true, district: true, subdistrict: true },
                take: 20000,
            }),
            prisma.pm25_daily.aggregate({ where, _avg: { pm25: true } }),
        ]);

        let series: SeriesRow[] = rows.map(r => ({
            date: r.date instanceof Date ? r.date : new Date(r.date as any),
            pm25: r.pm25 == null ? null : Number(r.pm25),
            province: r.province ?? null,
            district: r.district ?? null,
            subdistrict: r.subdistrict ?? null,
        }));

        if (granularity === "week") {
            type Acc = { sum: number; count: number; week: Date; province: string | null; district: string | null; subdistrict: string | null; };
            const m = new Map<string, Acc>();
            for (const r of series) {
                if (r.pm25 == null) continue;
                const wk = startOfWeek(r.date);
                const key = `${wk.toISOString().slice(0, 10)}|${r.subdistrict ?? ""}|${r.district ?? ""}|${r.province ?? ""}`;
                const cur = m.get(key);
                if (!cur) m.set(key, { sum: r.pm25, count: 1, week: wk, province: r.province, district: r.district, subdistrict: r.subdistrict });
                else { cur.sum += r.pm25; cur.count += 1; }
            }
            series = Array.from(m.values())
                .sort((a, b) => a.week.getTime() - b.week.getTime())
                .map(v => ({ date: v.week, pm25: v.count > 0 ? v.sum / v.count : null, province: v.province, district: v.district, subdistrict: v.subdistrict }));
        }

        const pm25DailyTrend = series.map(r => ({
            date: r.date.toISOString(),
            pm25: r.pm25,
            province: r.province,
            district: r.district,
            subdistrict: r.subdistrict,
        }));

        const avgPm25 = avgAgg._avg.pm25 == null ? 0 : Number(avgAgg._avg.pm25);

        return NextResponse.json({
            summary: { avgPm25, totalPatientsResp: 0, onlineStations: 0, alertCount: 0 },
            pm25DailyTrend,
        });
    } catch (err) {
        console.error("[GET /api/dashboard/pm25-patients] error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
