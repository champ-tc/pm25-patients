// src/lib/pm25Filters.ts
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const FilterSchema = z.object({
    startDate: z.string().min(10).optional(),
    endDate: z.string().min(10).optional(),
    region: z.string().optional(),      // = regionalHealth ในตาราง
    province: z.string().optional(),
    district: z.string().optional(),
    subdistrict: z.string().optional(),
    granularity: z.enum(["day", "week"]).optional(),
});

const trim = (v?: string | null) => (v ?? "").trim() || undefined;

export function parseFilters(url: string) {
    const sp = new URL(url).searchParams;
    const parsed = FilterSchema.parse({
        startDate: sp.get("startDate") || undefined,
        endDate: sp.get("endDate") || undefined,
        region: trim(sp.get("region")),
        province: trim(sp.get("province")),
        district: trim(sp.get("district")),
        subdistrict: trim(sp.get("subdistrict")),
        granularity: (sp.get("granularity") as "day" | "week") || undefined,
    });

    // จัดลำดับวันที่ให้ถูก (สลับถ้าใส่มาผิด)
    const s = parsed.startDate ? new Date(parsed.startDate) : undefined;
    const e = parsed.endDate ? new Date(parsed.endDate) : undefined;
    const [gte, lte] =
        s && e && s > e ? [e, s] : [s, e];

    return { ...parsed, gte, lte };
}

export function buildWhere(f: ReturnType<typeof parseFilters>): Prisma.pm25_dailyWhereInput {
    return {
        ...(f.gte || f.lte ? { date: { ...(f.gte && { gte: f.gte }), ...(f.lte && { lte: f.lte }) } } : {}),
        ...(f.region ? { regionalHealth: f.region } : {}),
        ...(f.province ? { province: f.province } : {}),
        ...(f.district ? { district: f.district } : {}),
        ...(f.subdistrict ? { subdistrict: f.subdistrict } : {}),
        pm25: { not: null },
    };
}

// ใช้คำนวณเริ่มสัปดาห์ (จันทร์)
export function startOfWeek(d: Date) {
    const x = new Date(d);
    const dow = x.getDay(); // 0..6
    const diff = dow === 0 ? -6 : 1 - dow;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
}
