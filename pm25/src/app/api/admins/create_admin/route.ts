// C:\dev\pm25-patients\pm25\src\app\api\admins\create_admin\route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const d = await req.json();

        // --- ตรวจค่าบังคับ ---
        if (!d.username || !d.password || !d.fname || !d.lname || !d.hospcode)
            return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });

        // --- ตรวจซ้ำ username / email ---
        const exists = await prisma.admin.findFirst({
            where: { OR: [{ username: d.username }, { email: d.email || "" }] },
        });
        if (exists)
            return NextResponse.json({ error: "มีผู้ใช้นี้อยู่แล้ว" }, { status: 409 });

        // --- สร้างผู้ใช้ใหม่ ---
        const data = await prisma.admin.create({
            data: {
                username: d.username,
                password: await bcrypt.hash(d.password, 10), // ✅ ใช้ชื่อ field เดิมใน schema
                role: d.role || "admin",
                pname: d.pname || null,
                fname: d.fname,
                lname: d.lname,
                hospcode: d.hospcode,
                position: d.position || null,
                positionLv: d.positionLv || null,
                tel: d.tel || null,
                email: d.email || null,
            },
        });


        return NextResponse.json({ data }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
    }
}
