// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("Authentication")?.value;
    if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

    const payload = verifyAuthToken(token);
    if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 });

    return NextResponse.json({ authenticated: true, user: payload });
}
