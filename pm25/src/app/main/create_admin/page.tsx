"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ROLES = ["administrator", "superadmin", "admin", "region", "province", "unit"] as const;

type HS = {
    hospcode: string;
    hospcode_old: string | null;
    name_th: string | null;
    organizations: string | null;
    province: string | null;
};

export default function CreateAdminPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // dropdown hospcode
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<HS[]>([]);
    const [active, setActive] = useState(-1);
    const [selected, setSelected] = useState<HS | null>(null);
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    // fetch suggestions (debounce 200ms)
    useEffect(() => {
        if (!open) return;
        const s = q.trim();
        if (s.length < 1) { setResults([]); setActive(-1); return; }

        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const r = await fetch(`/api/hospcodes?q=${encodeURIComponent(s)}`);
                const j = await r.json();
                setResults(j?.data ?? []);
                setActive((j?.data?.length ?? 0) > 0 ? 0 : -1);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 200);
        return () => clearTimeout(t);
    }, [q, open]);

    function label(h: HS) {
        // ชอบให้แสดง name_th ก่อน ถ้าไม่มีค่อย fallback เป็น organizations
        const name = h.name_th || h.organizations || "-";
        const old = h.hospcode_old ?? "-";
        return `${old} - ${name}`;
    }
    function choose(h: HS) {
        setSelected(h);
        setQ(label(h));    // แสดง label
        setOpen(false);
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setSubmitting(true);
            setErr(null);

            const form = e.currentTarget;
            const fd = new FormData(form);
            const payload = Object.fromEntries(fd.entries());

            if (selected) {
                payload.hospcode = selected.hospcode;
            }

            const res = await fetch("/api/admins/create_admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                alert("❌ ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
                return;
            }

            const json = await res.json();
            if (json?.error) {
                alert(`❌ ไม่สำเร็จ: ${json.error}`);
                return;
            }

            alert("✅ เพิ่มผู้ดูแลระบบเรียบร้อยแล้ว");
            form.reset();
            setSelected(null);
        } catch (err) {
            alert("❌ เกิดข้อผิดพลาดระหว่างส่งข้อมูล");
        } finally {
            setSubmitting(false);
        }
    }



    return (
        <div className="min-h-screen bg-white text-slate-800">
            <Navbar />
            <main className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">เพิ่มผู้ดูแลระบบ</h1>
                    <p className="text-slate-600">ค้นหา hospcode จาก dropdown และเลือกคำนำหน้า</p>
                </div>

                <form onSubmit={onSubmit} className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    {err && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {err}
                        </div>
                    )}

                    {/* บัญชีผู้ใช้ */}
                    <section>
                        <h2 className="mb-3 text-lg font-medium">บัญชีผู้ใช้</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm">Username *</label>
                                <input name="username" required placeholder="admin01"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm">Password *</label>
                                <input name="password" type="password" required placeholder="••••••••"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm">สิทธิ์ (Role)</label>
                                <select name="role" defaultValue="admin"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2">
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* ข้อมูลบุคคล */}
                    <section>
                        <h2 className="mb-3 text-lg font-medium">ข้อมูลบุคคล</h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm">คำนำหน้า</label>
                                <select name="pname" className="w-full rounded-md border border-slate-300 px-3 py-2">
                                    <option value="">— เลือก —</option>
                                    <option value="นาย">นาย</option>
                                    <option value="นาง">นาง</option>
                                    <option value="นางสาว">นางสาว</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm">ชื่อ *</label>
                                <input name="fname" required placeholder="สมชาย"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm">สกุล *</label>
                                <input name="lname" required placeholder="ใจดี"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2" />
                            </div>
                        </div>
                    </section>

                    {/* หน่วยงาน/ติดต่อ */}
                    <section>
                        <h2 className="mb-3 text-lg font-medium">หน่วยงาน/ติดต่อ</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Hospcode dropdown */}
                            <div className="sm:col-span-2" ref={boxRef}>
                                <label className="mb-1 block text-sm">รหัสหน่วยบริการ (Hospcode)</label>

                                <input
                                    value={q}
                                    onChange={(e) => { setQ(e.target.value); setOpen(true); setSelected(null); }}
                                    onFocus={() => setOpen(true)}
                                    onKeyDown={(e) => {
                                        if (!open || results.length === 0) return;
                                        if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % results.length); }
                                        else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i - 1 + results.length) % results.length); }
                                        else if (e.key === "Enter") { e.preventDefault(); if (active >= 0) choose(results[active]); }
                                        else if (e.key === "Escape") { setOpen(false); }
                                    }}
                                    placeholder="พิมพ์รหัส/ชื่อ/หน่วยงาน เช่น 9680 หรือ กองโรค..."
                                    autoComplete="off"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                                />

                                {open && (
                                    <div className="relative">
                                        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-md">
                                            {loading && <div className="px-3 py-2 text-sm text-slate-500">กำลังค้นหา...</div>}
                                            {!loading && results.length === 0 && q.trim().length >= 1 && (
                                                <div className="px-3 py-2 text-sm text-slate-500">ไม่พบข้อมูล</div>
                                            )}
                                            {!loading && results.length > 0 && (
                                                <ul role="listbox" className="max-h-64 overflow-auto">
                                                    {results.map((h, idx) => (
                                                        <li
                                                            key={h.hospcode}
                                                            role="option"
                                                            aria-selected={idx === active}
                                                            onMouseEnter={() => setActive(idx)}
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => choose(h)}
                                                            className={`cursor-pointer px-3 py-2 text-sm ${idx === active ? "bg-slate-100" : "hover:bg-slate-50"
                                                                }`}
                                                        >
                                                            <div className="font-medium text-slate-900">
                                                                {label(h)}
                                                            </div>
                                                            <div className="text-xs text-slate-600">
                                                                hospcode: {h.hospcode}
                                                                {h.province ? ` • ${h.province}` : ""}
                                                                {h.organizations ? ` • ${h.organizations}` : ""}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <p className="mt-1 text-xs text-slate-500">
                                    * เลือกจากรายการ (แสดง <b>hospcode_old - ชื่อ/หน่วยงาน</b>) — ระบบบันทึกเป็น <b>hospcode</b> จริง
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm">ตำแหน่ง</label>
                                <input name="position" className="w-full rounded-md border border-slate-300 px-3 py-2" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm">ระดับตำแหน่ง</label>
                                <input name="positionLv" className="w-full rounded-md border border-slate-300 px-3 py-2" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm">โทรศัพท์</label>
                                <input name="tel" className="w-full rounded-md border border-slate-300 px-3 py-2" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm">อีเมล</label>
                                <input name="email" type="email" placeholder="name@example.com"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2" />
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {submitting ? "กำลังบันทึก..." : "บันทึกผู้ดูแลระบบ"}
                        </button>
                        <a href="/main/admins" className="rounded-md border border-slate-200 px-4 py-2 hover:bg-slate-50">
                            ยกเลิก
                        </a>
                    </div>
                </form>
            </main>
        </div>
    );
}
