// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    // path ที่ต้องล็อกอินก่อนเข้า
    const protectedPrefix = "/";

    // อนุญาตหน้า /login ไม่ต้องเช็ค
    if (req.nextUrl.pathname.startsWith("/login")) {
        return NextResponse.next();
    }

    // หน้าอื่นๆ ให้ถือว่าเป็น protected zone
    const token = req.cookies.get("Authentication")?.value;
    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", req.nextUrl.pathname); // กลับมาหน้าเดิมหลังล็อกอิน
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// ระบุเส้นทางที่ middleware ทำงาน (ทั้งแอป ยกเว้นไฟล์ static)
export const config = {
    matcher: ["/((?!_next|favicon.ico|public).*)"],
};
