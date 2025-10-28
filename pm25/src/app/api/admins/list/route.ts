import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    try {
        const [items, total] = await Promise.all([
            prisma.admin.findMany({
                skip,
                take: limit,
                orderBy: { id: "desc" },
                select: {
                    id: true,
                    username: true,
                    fname: true,
                    lname: true,
                    role: true,
                    hospcode: true,
                    tel: true,
                    email: true,
                },
            }),
            prisma.admin.count(),
        ]);
        return NextResponse.json({ items, total });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
    }
}
