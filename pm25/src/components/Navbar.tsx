"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
    { label: "หน้าแรก", href: "/main" },
    { label: "แดชบอร์ด", href: "/dashboard" },
    { label: "ผู้ใช้", href: "/admin/users" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    // ✅ ฟังก์ชันออกจากระบบ
    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch (e) {
            console.error("logout error:", e);
        } finally {
            router.push("/");
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
                {/* Brand */}
                <Link href="/main" className="group flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500/60">
                        <span className="text-sm font-semibold">PP</span>
                    </div>
                    <div className="leading-tight">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition">
                            PM2.5 & Patients
                        </div>
                        <div className="text-[11px] text-slate-500">EnvOcc</div>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    {NAV.map((m) => {
                        const active = pathname.startsWith(m.href);
                        return (
                            <Link
                                key={m.href}
                                href={m.href}
                                className={`text-sm font-medium ${active ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"}`}
                            >
                                {m.label}
                            </Link>
                        );
                    })}

                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
                    >
                        ออกจากระบบ
                    </button>
                </div>

                {/* Mobile toggler */}
                <button
                    aria-label="เปิดเมนู"
                    onClick={() => setOpen((o) => !o)}
                    className="md:hidden rounded-lg border border-slate-200 p-2 text-slate-700"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        {open ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden border-t border-slate-200 bg-white">
                    <nav className="mx-auto max-w-7xl px-4 py-3 space-y-1">
                        {NAV.map((m) => {
                            const active = pathname.startsWith(m.href);
                            return (
                                <Link
                                    key={m.href}
                                    href={m.href}
                                    onClick={() => setOpen(false)}
                                    className={`block rounded-lg px-3 py-2 text-sm ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    {m.label}
                                </Link>
                            );
                        })}

                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    handleLogout();
                                }}
                                className="block w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                ออกจากระบบ
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
