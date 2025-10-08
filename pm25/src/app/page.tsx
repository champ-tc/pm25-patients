"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/main";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    setPending(true);
    await new Promise((r) => setTimeout(r, 400));
    router.push(next);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left */}
        <div className="order-2 md:order-1 space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            PM2.5 & Patients Portal
          </span>
          <h1 className="text-4xl font-bold leading-tight">
            เข้าสู่ระบบ <span className="text-indigo-600">PM2.5</span> &{" "}
            <span className="text-indigo-600">Patients</span>
          </h1>
          <p className="text-slate-600 max-w-md">
            ดูแดชบอร์ดภาพรวมผู้ป่วย แนวโน้มฝุ่น PM2.5 และจัดการผู้ดูแลระบบ
          </p>
        </div>

        {/* Right: Form card */}
        <div className="order-1 md:order-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-semibold mb-6 text-center">เข้าสู่ระบบ</h2>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit}>
              <label className="block text-sm mb-1">ชื่อผู้ใช้</label>
              <input
                className="w-full mb-4 rounded-lg border border-slate-300 bg-white px-3 py-2 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label className="block text-sm mb-1">รหัสผ่าน</label>
              <input
                type="password"
                className="w-full mb-6 rounded-lg border border-slate-300 bg-white px-3 py-2 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-indigo-600 text-white font-medium py-2.5 hover:bg-indigo-500 active:bg-indigo-600 transition disabled:opacity-60"
              >
                {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>

              <p className="mt-4 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} EnvOcc Team
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
