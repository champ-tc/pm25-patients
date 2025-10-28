"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import Link from "next/link";


type Admin = {
    id: number;
    username: string;
    role: string;
    fname: string;
    lname: string;
    hospcode?: string | null;
    email?: string | null;
    tel?: string | null;
};

export default function AdminListPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [editItem, setEditItem] = useState<Admin | null>(null);

    const limit = 10;

    useEffect(() => {
        loadAdmins();
    }, [page]);

    async function loadAdmins() {
        try {
            setLoading(true);
            const res = await fetch(`/api/admins/list?page=${page}&limit=${limit}`, {
                cache: "no-store",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "โหลดข้อมูลไม่สำเร็จ");
            setAdmins(data.items || []);
            setTotal(data.total || 0);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("ยืนยันการลบผู้ดูแลระบบนี้?")) return;
        const res = await fetch(`/api/admins/delete?id=${id}`, { method: "DELETE" });
        if (res.ok) {
            alert("ลบสำเร็จ");
            loadAdmins();
        } else {
            alert("ลบไม่สำเร็จ");
        }
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Navbar />
            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-slate-900">จัดการผู้ดูแลระบบ</h1>
                    <Link
                        href="/main/create_admin"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        + เพิ่มผู้ดูแล
                    </Link>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-center py-10 text-slate-500">กำลังโหลดข้อมูล...</p>
                ) : admins.length === 0 ? (
                    <p className="text-center py-10 text-slate-500">ไม่พบข้อมูล</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-sm text-slate-700">
                            <thead className="bg-slate-100 text-left text-slate-600">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">ชื่อผู้ใช้</th>
                                    <th className="px-4 py-3">ชื่อ-สกุล</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Hospcode</th>
                                    <th className="px-4 py-3">โทรศัพท์</th>
                                    <th className="px-4 py-3">อีเมล</th>
                                    <th className="px-4 py-3 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((a, i) => (
                                    <tr key={a.id} className="border-t hover:bg-slate-50">
                                        <td className="px-4 py-2">{(page - 1) * limit + i + 1}</td>
                                        <td className="px-4 py-2 font-medium">{a.username}</td>
                                        <td className="px-4 py-2">{a.fname} {a.lname}</td>
                                        <td className="px-4 py-2">{a.role}</td>
                                        <td className="px-4 py-2">{a.hospcode || "-"}</td>
                                        <td className="px-4 py-2">{a.tel || "-"}</td>
                                        <td className="px-4 py-2">{a.email || "-"}</td>
                                        <td className="px-4 py-2 text-center space-x-2">
                                            <button
                                                onClick={() => setEditItem(a)}
                                                className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                onClick={() => handleDelete(a.id)}
                                                className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`rounded-md px-3 py-1 text-sm ${page === i + 1
                                        ? "bg-blue-600 text-white"
                                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Modal แก้ไข */}
                {editItem && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="text-lg font-semibold mb-4">แก้ไขข้อมูล</h2>
                            <EditForm
                                admin={editItem}
                                onClose={() => setEditItem(null)}
                                onSaved={() => {
                                    setEditItem(null);
                                    loadAdmins();
                                }}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

/* ------------------ Form แก้ไข ------------------ */
function EditForm({
    admin,
    onClose,
    onSaved,
}: {
    admin: Admin;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState(admin);
    const [saving, setSaving] = useState(false);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const res = await fetch("/api/admins/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            alert("บันทึกสำเร็จ");
            onSaved();
        } else {
            alert("บันทึกไม่สำเร็จ");
        }
        setSaving(false);
    }

    return (
        <form onSubmit={handleSave} className="space-y-3 text-sm">
            <div>
                <label className="block mb-1 text-slate-700">ชื่อ</label>
                <input
                    value={form.fname}
                    onChange={(e) => setForm({ ...form, fname: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-1.5"
                />
            </div>
            <div>
                <label className="block mb-1 text-slate-700">สกุล</label>
                <input
                    value={form.lname}
                    onChange={(e) => setForm({ ...form, lname: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-1.5"
                />
            </div>
            <div>
                <label className="block mb-1 text-slate-700">อีเมล</label>
                <input
                    value={form.email || ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-1.5"
                />
            </div>
            <div className="flex justify-end gap-2 pt-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50"
                >
                    ยกเลิก
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-blue-600 px-4 py-1 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
            </div>
        </form>
    );
}
