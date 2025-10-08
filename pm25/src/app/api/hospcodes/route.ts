import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type Row = {
    hospcode: string;
    hospcode_old: string | null;
    name_th: string | null;
    organizations: string | null;
    province: string | null;
    amphure: string | null;
    districts: string | null;
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const qRaw = (searchParams.get("q") || "").trim();
    if (!qRaw) return NextResponse.json({ data: [] });

    const tokens = qRaw.split(/\s+/).filter(Boolean);

    // -------- 1) ORM where: AND ของทุก token, แต่ละ token OR ทุกคอลัมน์
    const col = ["hospcode", "hospcode_old", "name_th", "organizations", "province", "amphure", "districts"] as const;
    const orsForToken = (t: string) =>
        col.map((c) => ({ [c]: { contains: t, mode: "insensitive" as const } })) as Prisma.HospcodeWhereInput[];

    const whereAND: Prisma.HospcodeWhereInput = { AND: tokens.map((t) => ({ OR: orsForToken(t) })) };
    const whereOR: Prisma.HospcodeWhereInput = { OR: orsForToken(qRaw) };

    // helper ORM search
    async function searchORM(where: Prisma.HospcodeWhereInput) {
        try {
            return await prisma.hospcode.findMany({
                where,
                select: {
                    hospcode: true,
                    hospcode_old: true,
                    name_th: true,
                    organizations: true,
                    province: true,
                    amphure: true,
                    districts: true,
                },
                take: 50,
                orderBy: [{ name_th: "asc" }, { hospcode: "asc" }],
            });
        } catch {
            return [] as Row[];
        }
    }

    // -------- 2) RAW fallback: ลองทั้ง "Hospcode" (Camel) และ hospcode (lower)
    const likeAny = `%${qRaw}%`;
    const starts = `${qRaw}%`;

    async function searchRaw(tableName: '"Hospcode"' | "hospcode") {
        try {
            return await prisma.$queryRaw<Row[]>(Prisma.sql`
        SELECT
            hospcode,
            hospcode_old::text AS hospcode_old,
            name_th,
            organizations,
            province,
            amphure,
            districts
        FROM ${Prisma.raw(tableName)}
        WHERE
            hospcode ILIKE ${starts}
            OR hospcode_old::text ILIKE ${starts}
            OR name_th ILIKE ${likeAny}
            OR organizations ILIKE ${likeAny}
            OR province ILIKE ${likeAny}
            OR amphure ILIKE ${likeAny}
            OR districts ILIKE ${likeAny}
        ORDER BY name_th NULLS LAST, hospcode
        LIMIT 50
    `);
        } catch {
            return [] as Row[];
        }
    }

    // ลอง ORM (AND) → ORM (OR) → RAW ("Hospcode") → RAW (hospcode)
    let data: Row[] = await searchORM(whereAND);
    if (data.length === 0) data = await searchORM(whereOR);
    if (data.length === 0) data = await searchRaw('"Hospcode"');
    if (data.length === 0) data = await searchRaw("hospcode");

    return NextResponse.json({ data });
}
