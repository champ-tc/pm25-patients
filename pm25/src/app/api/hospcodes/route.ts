import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const g = global as any;
const prisma: PrismaClient = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q) return NextResponse.json({ data: [], total: 0, shown: 0 }, { status: 200 });

    const take = q.length === 1 ? 120 : q.length === 2 ? 100 : 60;

    // ✅ กำหนด type ตรงๆ และไม่ใช้ `as const`
    const where: Prisma.hospcodeWhereInput = {
      OR: [
        { hospcode: { contains: q, mode: "insensitive" } },
        { hospcode_old: { contains: q, mode: "insensitive" } },
        { name_th: { contains: q, mode: "insensitive" } },
        { organizations: { contains: q, mode: "insensitive" } },
        { province: { contains: q, mode: "insensitive" } },
        { amphure: { contains: q, mode: "insensitive" } },
        { districts: { contains: q, mode: "insensitive" } },
        { county: { contains: q, mode: "insensitive" } },
      ],
    };

    const [total, data] = await Promise.all([
      prisma.hospcode.count({ where }),
      prisma.hospcode.findMany({
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
        // ถ้า TS ฟ้อง type ที่ distinct ให้ใช้วิธี A หรือ B ด้านล่าง
        distinct: ["hospcode"],
        orderBy: [{ name_th: "asc" }, { organizations: "asc" }, { hospcode_old: "asc" }],
        take,
      }),
    ]);

    return NextResponse.json({ data, total, shown: data.length }, { status: 200 });
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error("[api/hospcodes] error:", e);
    return NextResponse.json({ data: [], total: 0, shown: 0 }, { status: 200 });
  }
}
