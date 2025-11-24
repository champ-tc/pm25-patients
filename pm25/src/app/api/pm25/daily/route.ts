// src/app/api/pm25/daily/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const startDate = searchParams.get("startDate"); // 2020-01-01
        const endDate = searchParams.get("endDate");     // 2025-11-16
        const region = searchParams.get("region");       // เขตสุขภาพ
        const province = searchParams.get("province");   // จังหวัด
        const district = searchParams.get("district");   // อำเภอ

        const where: any = {};

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        if (region) {
            where.regionalHealth = region;
        }

        if (province) {
            where.province = province;
        }

        if (district) {
            where.district = district;
        }

        const data = await prisma.pm25_daily.findMany({
            where,
            orderBy: { date: "asc" },
        });

        return NextResponse.json({ data });
    } catch (err) {
        console.error("[GET /api/pm25/daily]", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
