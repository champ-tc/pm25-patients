"use client";

import { useEffect, useMemo, useState } from "react";

// ISO-3166-2 รหัสจังหวัด (GeoChart ต้องใช้)
const TH_ISO: Record<string, string> = {
    "กรุงเทพมหานคร": "TH-10", "สมุทรปราการ": "TH-11", "นนทบุรี": "TH-12", "ปทุมธานี": "TH-13", "พระนครศรีอยุธยา": "TH-14",
    "อ่างทอง": "TH-15", "ลพบุรี": "TH-16", "สิงห์บุรี": "TH-17", "ชัยนาท": "TH-18", "สระบุรี": "TH-19",
    "ชลบุรี": "TH-20", "ระยอง": "TH-21", "จันทบุรี": "TH-22", "ตราด": "TH-23", "ฉะเชิงเทรา": "TH-24", "ปราจีนบุรี": "TH-25", "นครนายก": "TH-26", "สระแก้ว": "TH-27",
    "นครราชสีมา": "TH-30", "บุรีรัมย์": "TH-31", "สุรินทร์": "TH-32", "ศรีสะเกษ": "TH-33", "อุบลราชธานี": "TH-34", "ยโสธร": "TH-35", "ชัยภูมิ": "TH-36",
    "อำนาจเจริญ": "TH-37", "บึงกาฬ": "TH-38", "หนองบัวลำภู": "TH-39", "ขอนแก่น": "TH-40", "อุดรธานี": "TH-41", "เลย": "TH-42", "หนองคาย": "TH-43",
    "มหาสารคาม": "TH-44", "ร้อยเอ็ด": "TH-45", "กาฬสินธุ์": "TH-46", "สกลนคร": "TH-47", "นครพนม": "TH-48", "มุกดาหาร": "TH-49",
    "เชียงใหม่": "TH-50", "ลำพูน": "TH-51", "ลำปาง": "TH-52", "อุตรดิตถ์": "TH-53", "แพร่": "TH-54", "น่าน": "TH-55", "พะเยา": "TH-56", "เชียงราย": "TH-57", "แม่ฮ่องสอน": "TH-58",
    "นครสวรรค์": "TH-60", "อุทัยธานี": "TH-61", "กำแพงเพชร": "TH-62", "ตาก": "TH-63", "สุโขทัย": "TH-64", "พิษณุโลก": "TH-65", "พิจิตร": "TH-66", "เพชรบูรณ์": "TH-67",
    "ราชบุรี": "TH-70", "กาญจนบุรี": "TH-71", "สุพรรณบุรี": "TH-72", "นครปฐม": "TH-73", "สมุทรสาคร": "TH-74", "สมุทรสงคราม": "TH-75", "เพชรบุรี": "TH-76", "ประจวบคีรีขันธ์": "TH-77",
    "นครศรีธรรมราช": "TH-80", "กระบี่": "TH-81", "พังงา": "TH-82", "ภูเก็ต": "TH-83", "สุราษฎร์ธานี": "TH-84", "ระนอง": "TH-85", "ชุมพร": "TH-86",
    "สงขลา": "TH-90", "สตูล": "TH-91", "ตรัง": "TH-92", "พัทลุง": "TH-93", "ปัตตานี": "TH-94", "ยะลา": "TH-95", "นราธิวาส": "TH-96"
};

// ตัดคำว่า "จังหวัด" และเว้นวรรคส่วนเกิน (พอแล้วสำหรับเคสทั่วไป)
const norm = (s?: string) =>
    (s ?? "").replace(/^\s*จังหวัด\s*/u, "").replace(/\s+/g, " ").trim()
        .replace(/^กรุงเทพฯ$|^กทม$/u, "กรุงเทพมหานคร");

type Item = { province: string; avgPm25: number };

export default function PM25MapPage() {
    const [rows, setRows] = useState<(string | number)[][]>([["Province", "PM2.5"]]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const startDate = "2024-01-01";
    const endDate = "2024-12-31";

    useEffect(() => {
        (async () => {
            try {
                setLoading(true); setErr(null);
                const q = new URLSearchParams({ startDate, endDate });
                const res = await fetch(`/api/dashboard/pm25-provinces?${q}`, { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: Item[] = await res.json();

                const r: (string | number)[][] = [["Province", "PM2.5"]];
                for (const it of data) {
                    const code = TH_ISO[norm(it.province)];
                    if (code) r.push([code, Number(it.avgPm25) || 0]);
                }
                setRows(r);
            } catch (e: any) {
                setErr(e.message ?? "โหลดข้อมูลไม่ได้");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // วาด GeoChart แบบสั้น
    useEffect(() => {
        if (rows.length <= 1) return;

        const draw = () => {
            // @ts-ignore
            const google = (window as any).google;
            if (!google?.charts) return;
            google.charts.load("current", { packages: ["geochart"] });
            google.charts.setOnLoadCallback(() => {
                const el = document.getElementById("geo_pm25");
                if (!el) return;
                const data = google.visualization.arrayToDataTable(rows);
                const chart = new google.visualization.GeoChart(el);
                chart.draw(data, {
                    region: "TH",
                    resolution: "provinces",
                    colorAxis: { colors: ["#6ecf68", "#ffd54d", "#ff9800", "#f44336", "#9c27b0"] },
                    datalessRegionColor: "#e6e6e6",
                    backgroundColor: "transparent"
                });
            });
        };

        const s = document.querySelector('script[src^="https://www.gstatic.com/charts/loader.js"]');
        if (!s) {
            const tag = document.createElement("script");
            tag.src = "https://www.gstatic.com/charts/loader.js";
            tag.onload = draw;
            document.body.appendChild(tag);
        } else draw();
    }, [rows]);

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ textAlign: "center", marginBottom: 8 }}>แผนที่ PM2.5 รายจังหวัด</h2>
            {err && <p style={{ color: "red", textAlign: "center" }}>{err}</p>}
            {loading && <p style={{ textAlign: "center" }}>กำลังโหลด…</p>}
            <div id="geo_pm25" style={{ width: "100%", height: 560 }} />
        </div>
    );
}
