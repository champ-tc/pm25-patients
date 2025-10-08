import Navbar from "@/components/Navbar";
import Link from "next/link";

const CARDS = [
    {
        title: "Dashboard",
        desc: "สรุปภาพรวม / KPI / กราฟ",
        href: "/main/dashboard",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 13h4v8H3zM10 3h4v18h-4zM17 9h4v12h-4z" />
            </svg>
        ),
        gradient: "from-indigo-50 to-white ring-indigo-200/70",
    },
    {
        title: "ข้อมูลผู้ป่วย",
        desc: "ตาราง / ค้นหา / ตัวกรอง",
        href: "/main/patients",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 10h10M7 14h7M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
        ),
        gradient: "from-emerald-50 to-white ring-emerald-200/70",
    },
    {
        title: "ข้อมูลฝุ่น (PM2.5)",
        desc: "แผนที่ / แนวโน้ม / คำเตือน",
        href: "/main/pm25",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 17.5A5.5 5.5 0 1 0 9.6 9.1 7 7 0 1 1 20 17.5Z" />
            </svg>
        ),
        gradient: "from-sky-50 to-white ring-sky-200/70",
    },
    {
        title: "ผู้ดูแลระบบ",
        desc: "สิทธิ์ / บทบาท / ผู้ใช้",
        href: "/main/create_admin",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                <path d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
                <path d="M19 8v4m2-2h-4" />
            </svg>
        ),
        gradient: "from-fuchsia-50 to-white ring-fuchsia-200/70",
    },
];

export default function MainPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-800">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight">เมนูหลัก</h1>
                    <p className="text-slate-600">เลือกเมนูเพื่อเข้าสู่หน้าการทำงาน</p>
                </div>

                {/* Card grid */}
                <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {CARDS.map((c) => (
                        <Link
                            key={c.title}
                            href={c.href}
                            className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${c.gradient}
                            p-5 shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300`}
                        >
                            {/* top right glow */}
                            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/60 blur-3xl" />
                            <div className="flex items-start justify-between">
                                <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-2 text-slate-700 group-hover:text-indigo-700 transition">
                                    {c.icon}
                                </div>
                                <span className="text-xl text-slate-400 transition-transform group-hover:translate-x-1">
                                    →
                                </span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                            <p className="mt-1 text-sm text-slate-700/80">{c.desc}</p>

                            {/* underline accent */}
                            <span className="mt-4 block h-px w-0 bg-gradient-to-r from-slate-200 to-slate-300 transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </section>

            </main>
        </div>
    );
}
