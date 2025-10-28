import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, fname, lname, email } = body;
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

    try {
        await prisma.admin.update({
            where: { id },
            data: { fname, lname, email },
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "update failed" }, { status: 500 });
    }
}
