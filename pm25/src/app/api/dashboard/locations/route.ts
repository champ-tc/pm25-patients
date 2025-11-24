// src/app/api/dashboard/locations/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const clean = (v?: string | null) => (v ?? "").trim();

export async function GET() {
    try {
        // ลด duplicate ที่ DB เลย
        const rows = await prisma.pm25_daily.findMany({
            select: {
                regionalHealth: true,
                province: true,
                district: true,
                subdistrict: true,
            },
            where: {
                regionalHealth: { not: null },
                province: { not: null },
                district: { not: null },
                subdistrict: { not: null },
            },
            distinct: ["regionalHealth", "province", "district", "subdistrict"],
        });

        // ใช้ Map + Set เพื่อความกระชับ/กันซ้ำอีกชั้น
        const regionMap = new Map<string, Map<string, Map<string, Set<string>>>>();

        for (const r of rows) {
            const reg = clean(r.regionalHealth);
            const prov = clean(r.province);
            const dist = clean(r.district);
            const subd = clean(r.subdistrict);
            if (!reg || !prov || !dist || !subd) continue;

            const provMap = regionMap.get(reg) ?? regionMap.set(reg, new Map()).get(reg)!;
            const distMap = provMap.get(prov) ?? provMap.set(prov, new Map()).get(prov)!;
            const subs = distMap.get(dist) ?? distMap.set(dist, new Set()).get(dist)!;
            subs.add(subd);
        }

        // แปลงเป็นโครงสร้างผลลัพธ์ + sort ให้คงที่
        const regions = [...regionMap.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([region, provMap]) => ({
                region,
                provinces: [...provMap.entries()]
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([province, distMap]) => ({
                        province,
                        districts: [...distMap.entries()]
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([district, subs]) => ({
                                district,
                                subdistricts: [...subs].sort((a, b) => a.localeCompare(b)),
                            })),
                    })),
            }));

        return NextResponse.json({ regions });
    } catch (err) {
        console.error("[GET /api/dashboard/locations] error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
