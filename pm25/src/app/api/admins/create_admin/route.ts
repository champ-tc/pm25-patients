import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prisma singleton (dev hot-reload safe)
const g = global as unknown as { prisma?: PrismaClient };
const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

export async function POST(req: NextRequest) {
    try {
        // 0) guard content-type
        const ct = req.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
            return NextResponse.json({ error: "Content-Type ต้องเป็น application/json" }, { status: 415 });
        }

        const raw = await req.json().catch(() => ({} as any));

        // 1) normalize/trim
        const d = {
            username: String(raw.username ?? "").trim(),
            password: String(raw.password ?? ""),
            role: raw.role as Role | undefined,
            pname: raw.pname ? String(raw.pname).trim() : null,
            fname: String(raw.fname ?? "").trim(),
            lname: String(raw.lname ?? "").trim(),
            hospcode: raw.hospcode ? String(raw.hospcode).trim() : null,
            position: raw.position ? String(raw.position).trim() : null,
            positionLv: raw.positionLv ? String(raw.positionLv).trim() : null,
            tel: raw.tel ? String(raw.tel).trim() : null,
            email: raw.email ? String(raw.email).trim() : null,
        };

        // 2) require fields
        const missing: string[] = [];
        if (!d.username) missing.push("username");
        if (!d.password) missing.push("password");
        if (!d.fname) missing.push("fname");
        if (!d.lname) missing.push("lname");
        if (missing.length) {
            return NextResponse.json({ error: `ข้อมูลไม่ครบ: ${missing.join(", ")}` }, { status: 400 });
        }

        // 3) role guard (fallback เป็น admin)
        const role: Role = Object.values(Role).includes(d.role as Role) ? (d.role as Role) : Role.admin;

        // 4) create
        const created = await prisma.admin.create({
            data: {
                username: d.username,
                password: await bcrypt.hash(d.password, 10),
                role,
                pname: d.pname,
                fname: d.fname,
                lname: d.lname,
                hospcode: d.hospcode && d.hospcode !== "" ? d.hospcode : null,
                position: d.position,
                positionLv: d.positionLv,
                tel: d.tel,
                email: d.email,
            },
            select: { id: true, username: true, role: true },
        });

        return NextResponse.json({ data: created }, { status: 201 });
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
                return NextResponse.json({ error: "ค่า unique ซ้ำ (เช่น username/email ซ้ำ)" }, { status: 409 });
            }
            if (e.code === "P2003") {
                return NextResponse.json({ error: "อ้างอิง hospcode ไม่ถูกต้อง (FK ไม่พบ)" }, { status: 400 });
            }
        }
        if (process.env.NODE_ENV === "development") {
            console.error("[api/admins/create_admin] error:", e);
        }
        return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
    }
}
