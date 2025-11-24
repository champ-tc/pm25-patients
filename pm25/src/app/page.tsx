"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import Header from "@/components/Header";

// ==== Icons ====
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
);

// ==== Types ====
type RegionNode = {
  region: string;
  provinces: { province: string; districts: { district: string; subdistricts: string[] }[] }[];
};
type LocationsResponse = { regions: RegionNode[] };
type Pm25DailyPoint = { date: string; pm25: number | null; subdistrict?: string | null };
type DashboardResponse = { summary: { avgPm25: number }; pm25DailyTrend: Pm25DailyPoint[] };
type ProvincesItem = { province: string; avgPm25: number };

// ==== Helpers ====
const colorOf = (i: number) => `hsl(${(i * 137.508) % 360} 70% 40%)`;

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

const norm = (s?: string) =>
  (s ?? "").replace(/^\s*จังหวัด\s*/u, "").trim()
    .replace(/^กทม$|^กรุงเทพฯ$/u, "กรุงเทพมหานคร");

const loadGoogleOnce = (() => {
  let loaded = false;
  return (cb: () => void) => {
    // @ts-ignore
    const g = (window as any).google;
    if (g?.charts) return cb();
    if (!loaded) {
      loaded = true;
      const script = document.createElement("script");
      script.src = "https://www.gstatic.com/charts/loader.js";
      script.onload = () => {
        // @ts-ignore
        google.charts.load("current", { packages: ["geochart"] });
        // @ts-ignore
        google.charts.setOnLoadCallback(cb);
      };
      document.body.appendChild(script);
    } else {
      const timer = setInterval(() => {
        // @ts-ignore
        if ((window as any).google?.charts) {
          clearInterval(timer);
          cb();
        }
      }, 100);
    }
  };
})();

const buildQS = (obj: Record<string, string>) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => v && p.append(k, v));
  return p.toString();
};

// ==== UI Components ====
const FilterGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const SelectInput = ({ value, onChange, options, placeholder = "ทั้งหมด" }: any) => (
  <select
    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm hover:border-gray-300"
    value={value}
    onChange={onChange}
  >
    <option value="">{placeholder}</option>
    {options}
  </select>
);

const DateInput = ({ value, onChange }: any) => (
  <input
    type="date"
    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-700"
    value={value}
    onChange={onChange}
  />
);

export default function DashboardPage() {
  // Filters
  const [filter, setFilter] = useState({
    region: "",
    province: "",
    district: "",
    subdistrict: "",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    granularity: "week"
  });

  const update = (field: keyof typeof filter, value: string) => {
    setFilter((f) => {
      if (field === "region") return { ...f, region: value, province: "", district: "", subdistrict: "" };
      if (field === "province") return { ...f, province: value, district: "", subdistrict: "" };
      if (field === "district") return { ...f, district: value, subdistrict: "" };
      return { ...f, [field]: value };
    });
  };

  // Data states
  const [locations, setLocations] = useState<LocationsResponse | null>(null);
  const [trend, setTrend] = useState<Pm25DailyPoint[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [geoRows, setGeoRows] = useState<(string | number)[][]>([["Province", "PM2.5"]]);
  const [loading, setLoading] = useState(false);

  // Batch Abort
  const batchRef = useRef<AbortController | null>(null);
  const startBatch = () => {
    batchRef.current?.abort();
    batchRef.current = new AbortController();
    return batchRef.current.signal;
  };
  const fetchJSON = async (url: string, signal: AbortSignal) => {
    const res = await fetch(url, { cache: "no-store", signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  // Load locations
  useEffect(() => {
    const ac = new AbortController();
    fetchJSON("/api/dashboard/locations", ac.signal)
      .then(setLocations)
      .catch(() => { });
    return () => ac.abort();
  }, []);

  const provinces = useMemo(
    () => locations?.regions.find((r) => r.region === filter.region)?.provinces ?? [],
    [locations, filter.region]
  );
  const districts = useMemo(
    () => provinces.find((p) => p.province === filter.province)?.districts ?? [],
    [provinces, filter.province]
  );
  const subdistricts = useMemo(
    () => districts.find((d) => d.district === filter.district)?.subdistricts ?? [],
    [districts, filter.district]
  );

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const signal = startBatch();

      const qs = buildQS(filter);
      const [dTrend, dMap] = await Promise.all([
        fetchJSON(`/api/dashboard/pm25-patients?${qs}`, signal),
        fetchJSON(`/api/dashboard/pm25-provinces?${qs}`, signal)
      ]);

      const dash = dTrend as DashboardResponse;
      const map = dMap as ProvincesItem[];

      setAvg(dash.summary.avgPm25);
      setTrend(dash.pm25DailyTrend);

      const rows: (string | number)[][] = [["Province", "PM2.5"]];
      map.forEach((i) => {
        const code = TH_ISO[norm(i.province)];
        if (code) rows.push([code, i.avgPm25]);
      });
      setGeoRows(rows);
    } catch (e) {
      if ((e as any).name !== "AbortError") console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Build line chart data
  const { chartData, visibleKeys } = useMemo(() => {
    if (!trend.length) return { chartData: [], visibleKeys: [] as string[] };
    const map: Record<string, any> = {};
    const keys = new Set<string>();
    for (const r of trend) {
      const d = r.date.slice(0, 10);
      map[d] ||= { date: d };
      const sd = r.subdistrict ?? "ไม่ระบุตำบล";
      if (r.pm25 != null) {
        map[d][sd] = r.pm25;
        keys.add(sd);
      }
    }

    // เรียงลำดับคีย์
    const sortedKeys = [...keys].sort((a, b) => a.localeCompare(b, "th-TH"));

    // **LIMIT: ตัดให้เหลือแค่ 30 ตำบลแรก เพื่อไม่ให้กราฟพัง และ Label เยอะเกินไป**
    const limitedKeys = sortedKeys.slice(0, 30);

    const data = Object.values(map).map((row: any) => {
      const o: any = { date: row.date };
      // ใส่ข้อมูลเฉพาะ Keys ที่ผ่านการ Limit แล้ว
      limitedKeys.forEach((k) => { if (row[k] != null) o[k] = row[k]; });
      return o;
    });

    return { chartData: data, visibleKeys: limitedKeys };
  }, [trend]);

  // Draw map
  useEffect(() => {
    if (geoRows.length <= 1) return;
    loadGoogleOnce(() => {
      // @ts-ignore
      const google = window.google;
      const el = document.getElementById("geo_pm25");
      if (!el) return;
      const data = google.visualization.arrayToDataTable(geoRows);
      const chart = new google.visualization.GeoChart(el);
      chart.draw(data, {
        region: "TH",
        resolution: "provinces",
        colorAxis: { colors: ["#6ecf68", "#ffd54d", "#ff9800", "#f44336"] },
        datalessRegionColor: "#f3f4f6",
        backgroundColor: "transparent",
        keepAspectRatio: true,
      });
    });
  }, [geoRows]);

  const getAvgColor = (val: number | null) => {
    if (val === null) return "text-gray-400";
    if (val <= 25) return "text-green-500";
    if (val <= 37.5) return "text-yellow-500";
    if (val <= 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard ติดตามสถานการณ์ PM2.5</h1>
          <p className="text-gray-500 text-sm mt-1">แสดงข้อมูลค่าเฉลี่ยความเข้มข้นฝุ่นละอองรายพื้นที่</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <FilterGroup label="เขตสุขภาพ">
              <SelectInput
                value={filter.region}
                onChange={(e: any) => update("region", e.target.value)}
                options={locations?.regions.map((r) => (
                  <option key={r.region} value={r.region}>เขตสุขภาพที่ {r.region}</option>
                ))}
              />
            </FilterGroup>

            <FilterGroup label="จังหวัด">
              <SelectInput
                value={filter.province}
                onChange={(e: any) => update("province", e.target.value)}
                options={provinces.map((p) => (
                  <option key={p.province} value={p.province}>{p.province}</option>
                ))}
              />
            </FilterGroup>

            <FilterGroup label="อำเภอ">
              <SelectInput
                value={filter.district}
                onChange={(e: any) => update("district", e.target.value)}
                options={districts.map((d) => (
                  <option key={d.district} value={d.district}>{d.district}</option>
                ))}
              />
            </FilterGroup>

            <FilterGroup label="ตำบล">
              <SelectInput
                value={filter.subdistrict}
                onChange={(e: any) => update("subdistrict", e.target.value)}
                options={subdistricts.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              />
            </FilterGroup>

            <FilterGroup label="วันที่เริ่ม">
              <DateInput value={filter.startDate} onChange={(e: any) => update("startDate", e.target.value)} />
            </FilterGroup>

            <FilterGroup label="วันที่สิ้นสุด">
              <DateInput value={filter.endDate} onChange={(e: any) => update("endDate", e.target.value)} />
            </FilterGroup>

            <FilterGroup label="ความละเอียด">
              <SelectInput
                value={filter.granularity}
                onChange={(e: any) => update("granularity", e.target.value)}
                placeholder="เลือกช่วงเวลา"
                options={
                  <>
                    <option value="week">รายสัปดาห์ (แนะนำ)</option>
                    <option value="day">รายวัน</option>
                  </>
                }
              />
            </FilterGroup>

            <div className="flex items-end">
              <button
                onClick={loadData}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-blue-300"
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                ) : (
                  <SearchIcon />
                )}
                {loading ? "กำลังโหลด..." : "ค้นหาข้อมูล"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Stats + Map */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">ค่าเฉลี่ย PM2.5 รวม</h3>
              <div className={`text-5xl font-bold ${getAvgColor(avg)}`}>
                {avg?.toFixed(2) ?? "-"}
                <span className="text-lg text-gray-400 font-medium ml-2">µg/m³</span>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                มาตรฐานความปลอดภัยไม่ควรเกิน 37.5 µg/m³
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
              <h2 className="text-lg font-bold text-gray-800 mb-4">แผนที่รายจังหวัด</h2>
              <div id="geo_pm25" className="w-full h-[400px] rounded-lg overflow-hidden" />
              <p className="text-xs text-gray-400 text-center mt-2">*แสดงเฉดสีตามความเข้มข้น</p>
            </div>
          </div>

          {/* Right: Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">แนวโน้มค่าฝุ่น (Timeline)</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-3 h-3 border-b-2 border-red-500 border-dashed"></span>
                <span>เกณฑ์มาตรฐาน (37.5)</span>
              </div>
            </div>

            {/* FIX: บังคับความสูงกราฟ */}
            <div className="w-full" style={{ height: 500 }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f0f0f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />

                    {/* FIX: verticalAlign="bottom" เพื่อให้กราฟโชว์ก่อน Label และ Label อยู่ล่างสุด */}
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />

                    <ReferenceLine y={37.5} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'right', fill: '#ef4444', fontSize: 10 }} />

                    {/* Loop แค่ visibleKeys ที่ Limit ไว้ไม่เกิน 30 ตัว */}
                    {visibleKeys.map((sd, i) => (
                      <Line
                        key={sd}
                        dataKey={sd}
                        name={sd}
                        stroke={colorOf(i)}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                        type="monotone"
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ChartIcon />
                  <span>ไม่พบข้อมูลในช่วงเวลาหรือเงื่อนไขที่เลือก</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}