"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * ✅ AuthGuardMain: ตรวจ Auth ก่อนแสดงหน้า
 * - ถ้ายังไม่ login → logout + redirect ไป /
 * - บล็อกหน้าไว้จนกว่าจะตรวจเสร็จ
 */
export default function AuthGuardMain() {
    const router = useRouter();
    const pathname = usePathname();
    const [checking, setChecking] = useState(true); // บล็อก render จนเช็คเสร็จ

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // 🚀 ใช้ HEAD request เพื่อเช็ค cookie เร็วกว่าการดึง JSON
                const res = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                // ❌ ยังไม่ login หรือ token หมดอายุ
                if (!res.ok) {
                    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                    router.replace(`/`);
                    return;
                }

                const data = await res.json();
                if (!data?.authenticated) {
                    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                    router.replace(`/`);
                    return;
                }

                // ✅ ผ่าน auth แล้ว
                setChecking(false);
            } catch {
                await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                router.replace(`/`);
            }
        };

        // เรียกเช็คทันทีแบบ async
        checkAuth();
    }, [router, pathname]);

    // 🚫 ระหว่างเช็ค auth → ไม่ render อะไรเลย
    if (checking) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <div className="text-slate-600 text-sm animate-pulse">กำลังตรวจสอบสิทธิ์...</div>
            </div>
        );
    }

    return null; // ✅ render ผ่านแล้ว → ปล่อยหน้าแสดง
}
