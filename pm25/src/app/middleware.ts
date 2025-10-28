import { NextRequest, NextResponse } from "next/server";

// กันเฉพาะ /main และทุก path ใต้ /main
export const config = { matcher: ["/main/:path*"] };

export function middleware(req: NextRequest) {
    const token = req.cookies.get("Authentication")?.value;

    // ถ้าไม่มีคุกกี้เลย → ล้างคุกกี้ (เผื่อฝั่งบราวเซอร์ค้าง) แล้วเด้งไป login
    if (!token) {
        const url = new URL("/login", req.url);
        url.searchParams.set("next", req.nextUrl.pathname || "/main");

        const res = NextResponse.redirect(url);
        res.cookies.set("Authentication", "", {
            httpOnly: true,
            path: "/",
            maxAge: 0,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
        return res;
    }

    // มีคุกกี้ → ปล่อยผ่าน (ส่วน verify จะทำที่หน้า/คลientside ต่อ)
    return NextResponse.next();
}
