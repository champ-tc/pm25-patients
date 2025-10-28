import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signAuthToken } from "@/lib/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const g = global as any;
const prisma: PrismaClient = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "กรอกชื่อผู้ใช้และรหัสผ่าน" }, { status: 400 });
        }

        const user = await prisma.admin.findUnique({
            where: { username },
            select: { id: true, username: true, password: true, role: true, fname: true, lname: true },
        });

        if (!user) {
            return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
        }

        const token = signAuthToken({
            sub: String(user.id),
            username: user.username,
            role: user.role,
        });

        const res = NextResponse.json({
            id: user.id,
            username: user.username,
            role: user.role,
            name: `${user.fname ?? ""} ${user.lname ?? ""}`.trim(),
        });

        const isProd = process.env.NODE_ENV === "production";
        // เซ็ตคุกกี้ httpOnly
        res.cookies.set("Authentication", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8, // 8 ชั่วโมง
        });

        return res;
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
    }
}
