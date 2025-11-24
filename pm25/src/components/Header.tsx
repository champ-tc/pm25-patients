// ไฟล์: src/components/Header.tsx (หรือ components/Header.tsx)
import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl transition-all">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        EO
                    </div>
                    <span className="font-bold text-slate-800 text-lg tracking-tight">EnvOcc<span className="text-indigo-600">Portal</span></span>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <Link href="/" className="text-indigo-600 hover:text-indigo-700 transition">
                        หน้าแรก
                    </Link>
                    <Link href="/signin" className="hover:text-slate-900 transition">
                        เข้าสู่ระบบ
                    </Link>
                </nav>

            </div>
        </header>
    );
}