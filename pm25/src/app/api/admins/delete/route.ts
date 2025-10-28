import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

    try {
        await prisma.admin.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "ลบไม่สำเร็จ" }, { status: 500 });
    }
}
