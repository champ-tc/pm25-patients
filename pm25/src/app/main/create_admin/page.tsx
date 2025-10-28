"use client";
import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";
import { AdminCreateSchema, type AdminCreateInput, RoleValues } from "@/lib/validators/admin";

type HS = {
    hospcode: string;
    hospcode_old: string | null;
    name_th: string | null;
    organizations: string | null;
    province: string | null;
    amphure?: string | null;
    districts?: string | null;
};

type FieldErrors = Partial<Record<keyof AdminCreateInput, string[]>>;

const ROLES = RoleValues;

export default function CreateAdminPage() {
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    // autocomplete state ...
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<HS[]>([]);
    const [active, setActive] = useState(-1);
    const [hospcodeValue, setHospcodeValue] = useState<string>("");
    const [total, setTotal] = useState<number>(0);
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    useEffect(() => {
        if (!open) return;
        const s = q.trim();
        if (!s) { setResults([]); setActive(-1); setTotal(0); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const r = await fetch(`/api/hospcodes?q=${encodeURIComponent(s)}`);
                const j = await r.json().catch(() => ({}));
                const data: HS[] = Array.isArray(j?.data) ? j.data : [];
                setResults(data);
                setTotal(typeof j?.total === "number" ? j.total : data.length);
                setActive(data.length > 0 ? 0 : -1);
            } finally {
                setLoading(false);
            }
        }, 200);
        return () => clearTimeout(t);
    }, [q, open]);

    function label(h: HS) {
        const name = h.name_th || h.organizations || "-";
        const old = h.hospcode_old ?? "-";
        return `${old} - ${name}`;
    }
    function choose(h: HS) {
        setHospcodeValue(h.hospcode);
        setQ(label(h));
        setOpen(false);
    }

    // 👉 helper: render error under field
    const Err = ({ name }: { name: keyof AdminCreateInput }) =>
        fieldErrors?.[name]?.length ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors[name]![0]}</p>
        ) : null;

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg(null);
        setFieldErrors({});

        try {
            const form = e.currentTarget;
            const fd = new FormData(form);

            if (fd.get("user_name")) {
                fd.set("username", String(fd.get("user_name")));
                fd.delete("user_name");
            }

            // สร้าง object ตามสคีมา (trim จะทำใน Zod อีกชั้น)
            const raw: Partial<AdminCreateInput> = {
                username: String(fd.get("username") ?? ""),
                password: String(fd.get("password") ?? ""),
                role: ((fd.get("role") ?? "admin") as AdminCreateInput["role"]),
                pname: (fd.get("pname") ?? "") as string,
                fname: String(fd.get("fname") ?? ""),
                lname: String(fd.get("lname") ?? ""),
                hospcode: hospcodeValue || "",            // ถ้าไม่ได้เลือกจริงจะเป็น "", Zod จะเปลี่ยนเป็น undefined ให้
                position: (fd.get("position") ?? "") as string,
                positionLv: (fd.get("positionLv") ?? "") as string,
                tel: (fd.get("tel") ?? "") as string,
                email: (fd.get("email") ?? "") as string,
            };

            const parsed = AdminCreateSchema.safeParse(raw);
            if (!parsed.success) {
                // แสดง error ใต้ฟิลด์
                setFieldErrors(parsed.error.flatten().fieldErrors as FieldErrors);
                setSubmitting(false);
                return;
            }

            // ✅ ผ่านแล้วค่อยส่ง
            const res = await fetch("/api/admins/create_admin", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(parsed.data),
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                // ถ้า server ก็ส่ง issues (zod) มากลับมา
                if (json?.issues) setFieldErrors(json.issues as FieldErrors);
                setErrorMsg(json?.error || "บันทึกไม่สำเร็จ");
                setSubmitting(false);
                return;
            }

            alert("✅ เพิ่มผู้ดูแลระบบเรียบร้อยแล้ว");
            form.reset();
            setHospcodeValue("");
            setQ("");
            setResults([]);
            setActive(-1);
        } catch (err) {
            console.error("onSubmit Error:", err);
            setErrorMsg("เกิดข้อผิดพลาดระหว่างส่งข้อมูล");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Navbar />

            <main className="mx-auto max-w-4xl px-4 py-10">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        เพิ่มผู้ดูแลระบบ
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        กรอกข้อมูลให้ครบถ้วน แล้วกด “บันทึกผู้ดูแลระบบ”
                    </p>
                </div>

                {/* Form Card */}
                <form
                    onSubmit={onSubmit}
                    autoComplete="off"
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                    {errorMsg && (
                        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {errorMsg}
                        </div>
                    )}

                    <input type="hidden" name="hospcode" value={hospcodeValue} />

                    {/* Section: Account */}
                    <section className="space-y-5">
                        <h2 className="text-base font-medium text-slate-900">บัญชีผู้ใช้</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Username <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    name="user_name"
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <Err name="username" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Password <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <Err name="password" />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    สิทธิ์ (Role)
                                </label>
                                <select
                                    name="role"
                                    defaultValue="admin"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                                <Err name="role" />
                            </div>
                        </div>
                    </section>

                    <div className="my-8 h-px w-full bg-slate-200" />

                    {/* Section: Person */}
                    <section className="space-y-5">
                        <h2 className="text-base font-medium text-slate-900">ข้อมูลบุคคล</h2>
                        <div className="grid gap-5 sm:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    คำนำหน้า
                                </label>
                                <select className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" name="pname">
                                    <option value="">— เลือก —</option>
                                    <option value="นาย">นาย</option>
                                    <option value="นาง">นาง</option>
                                    <option value="นางสาว">นางสาว</option>
                                </select>
                                <Err name="pname" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    ชื่อ <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    name="fname"
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <Err name="fname" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    สกุล <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    name="lname"
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <Err name="lname" />
                            </div>
                        </div>
                    </section>

                    <div className="my-8 h-px w-full bg-slate-200" />

                    {/* Section: Organization / Contact */}
                    <section className="space-y-5">
                        <h2 className="text-base font-medium text-slate-900">หน่วยงาน/ติดต่อ</h2>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* Autocomplete */}
                            <div className="sm:col-span-2" ref={boxRef}>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    รหัสหน่วยบริการ (Hospcode){" "}
                                    <span className="text-slate-400">(ไม่บังคับ)</span>
                                </label>

                                <input
                                    value={q}
                                    onChange={(e) => {
                                        setQ(e.target.value);
                                        setOpen(true);
                                        setHospcodeValue("");
                                    }}
                                    onFocus={() => setOpen(true)}
                                    onKeyDown={(e) => {
                                        if (!open || results.length === 0) return;
                                        if (e.key === "ArrowDown") {
                                            e.preventDefault();
                                            setActive((i) => (i + 1) % results.length);
                                        } else if (e.key === "ArrowUp") {
                                            e.preventDefault();
                                            setActive((i) => (i - 1 + results.length) % results.length);
                                        } else if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (active >= 0) choose(results[active]);
                                        } else if (e.key === "Escape") {
                                            setOpen(false);
                                        }
                                    }}
                                    placeholder="พิมพ์รหัส/ชื่อ/หน่วยงาน เช่น 9680 หรือ กองโรค..."
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    เลือกจากรายการ (แสดง <b>รหัสเดิม - ชื่อ/หน่วยงาน</b>) — ระบบจะบันทึกเป็น <b>hospcode</b> จริง
                                </p>
                                <Err name="hospcode" />

                                {open && (
                                    <div className="relative">
                                        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                            {/* header */}
                                            <div className="flex items-center justify-between border-b bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                                <span>ผลการค้นหา</span>
                                                {loading ? (
                                                    <span>กำลังค้นหา…</span>
                                                ) : (
                                                    <span>
                                                        พบ {results.length}
                                                        {total > results.length ? ` / ${total}` : ""} รายการ
                                                    </span>
                                                )}
                                            </div>

                                            {/* list */}
                                            {!loading && results.length === 0 && q.trim() && (
                                                <div className="px-3 py-3 text-sm text-slate-500">
                                                    ไม่พบข้อมูล
                                                </div>
                                            )}
                                            {!loading && results.length > 0 && (
                                                <ul role="listbox" className="max-h-96 overflow-auto">
                                                    {results.map((h, idx) => (
                                                        <li
                                                            key={h.hospcode}
                                                            role="option"
                                                            aria-selected={idx === active}
                                                            onMouseEnter={() => setActive(idx)}
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => choose(h)}
                                                            className={`cursor-pointer px-4 py-2.5 text-sm transition ${idx === active ? "bg-blue-50" : "hover:bg-slate-50"
                                                                }`}
                                                        >
                                                            <div className="font-medium text-slate-900">
                                                                {(h.hospcode_old ?? "-") +
                                                                    " - " +
                                                                    (h.name_th || h.organizations || "-")}
                                                            </div>
                                                            <div className="mt-0.5 text-xs text-slate-600">
                                                                hospcode: {h.hospcode}
                                                                {h.province ? ` • ${h.province}` : ""}
                                                                {h.amphure ? ` • ${h.amphure}` : ""}
                                                                {h.districts ? ` • ${h.districts}` : ""}
                                                                {h.organizations ? ` • ${h.organizations}` : ""}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* footer */}
                                            {!loading && (
                                                <div className="border-t bg-white px-3 py-2 text-right text-[11px] text-slate-500">
                                                    แสดง {results.length}
                                                    {total > results.length ? ` จากทั้งหมด ${total}` : ""} รายการ
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    ตำแหน่ง
                                </label>
                                <input
                                    name="position"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <Err name="position" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    ระดับตำแหน่ง
                                </label>
                                <input
                                    name="positionLv"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <Err name="positionLv" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    โทรศัพท์
                                </label>
                                <input
                                    name="tel"
                                    placeholder="0XXXXXXXXX"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <Err name="tel" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    อีเมล
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <Err name="email" />
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <a
                            href="/main/admins"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-slate-700 transition hover:bg-slate-50"
                        >
                            ยกเลิก
                        </a>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
                        >
                            {submitting ? "กำลังบันทึก..." : "บันทึกผู้ดูแลระบบ"}
                        </button>
                    </div>
                </form>
            </main>
        </div>

    );
}
