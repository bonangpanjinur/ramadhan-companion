import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { guestStorage, getTodayKey } from "@/lib/guestStorage";
import { Loader2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

interface WeekData {
  day: string;
  ibadah: number;
  quran: number;
  sedekah: number;
  air: number;
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      key: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("id-ID", { weekday: "short" }),
    };
  });
}

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: "white",
  border: "1px solid hsl(60 10% 88%)",
  borderRadius: "12px",
  fontSize: "12px",
};

export default function ChartsPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [data, setData] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<"ibadah" | "quran" | "sedekah" | "kesehatan">("ibadah");

  useEffect(() => {
    async function fetchData() {
      const days = getLast7Days();
      const dateKeys = days.map(d => d.key);

      if (user) {
        const [ibadahRes, quranRes, sedekahRes, healthRes] = await Promise.all([
          supabase.from("daily_ibadah").select("tanggal, subuh, dzuhur, ashar, maghrib, isya, tahajud, dhuha, rawatib, witir, tadarus, sahur, buka_tepat_waktu").eq("user_id", user.id).in("tanggal", dateKeys),
          supabase.from("quran_progress").select("tanggal, halaman_dibaca").eq("user_id", user.id).in("tanggal", dateKeys),
          supabase.from("sedekah_log").select("tanggal, nominal").eq("user_id", user.id).in("tanggal", dateKeys),
          supabase.from("health_tracker").select("tanggal, gelas_air").eq("user_id", user.id).in("tanggal", dateKeys),
        ]);

        const ibadahMap: Record<string, number> = {};
        (ibadahRes.data || []).forEach(r => {
          const fields = ["subuh","dzuhur","ashar","maghrib","isya","tahajud","dhuha","rawatib","witir","tadarus","sahur","buka_tepat_waktu"];
          const done = fields.filter(f => r[f as keyof typeof r]).length;
          ibadahMap[r.tanggal] = Math.round((done / fields.length) * 100);
        });

        const quranMap: Record<string, number> = {};
        (quranRes.data || []).forEach(r => { quranMap[r.tanggal] = r.halaman_dibaca; });

        const sedekahMap: Record<string, number> = {};
        (sedekahRes.data || []).forEach(r => {
          sedekahMap[r.tanggal] = (sedekahMap[r.tanggal] || 0) + Number(r.nominal);
        });

        const healthMap: Record<string, number> = {};
        (healthRes.data || []).forEach(r => { healthMap[r.tanggal] = r.gelas_air; });

        setData(days.map(d => ({
          day: d.label,
          ibadah: ibadahMap[d.key] || 0,
          quran: quranMap[d.key] || 0,
          sedekah: (sedekahMap[d.key] || 0) / 1000,
          air: healthMap[d.key] || 0,
        })));
      } else {
        // Guest: use localStorage
        setData(days.map(d => {
          const ibadah = guestStorage.get<Record<string, boolean>>(`ibadah_${d.key}`, {});
          const total = Object.keys(ibadah).length;
          const done = Object.values(ibadah).filter(Boolean).length;
          return {
            day: d.label,
            ibadah: total > 0 ? Math.round((done / total) * 100) : 0,
            quran: guestStorage.get<number>(`quran_today_${d.key}`, 0),
            sedekah: 0,
            air: guestStorage.get<{gelas_air?: number}>(`health_${d.key}`, {}).gelas_air || 0,
          };
        }));
      }
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const CHARTS = [
    { id: "ibadah", label: "Ibadah", unit: "%", color: "hsl(129 19% 49%)", key: "ibadah" as const },
    { id: "quran", label: "Quran", unit: "hal", color: "hsl(42 51% 54%)", key: "quran" as const },
    { id: "sedekah", label: "Sedekah", unit: "rb", color: "hsl(216 34% 15%)", key: "sedekah" as const },
    { id: "kesehatan", label: "Air Minum", unit: "gls", color: "hsl(200 80% 50%)", key: "air" as const },
  ] as const;

  const current = CHARTS.find(c => c.id === activeChart)!;

  return (
    <div className="min-h-full flex flex-col bg-background pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-muted tap-target text-lg">←</button>
        <div>
          <h1 className="font-black text-xl">📊 Statistik Minggu Ini</h1>
          <p className="text-xs text-muted-foreground">Perkembangan ibadahmu 7 hari terakhir</p>
        </div>
      </div>

      {/* Chart Selector */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-2 scrollbar-hide">
        {CHARTS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveChart(c.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeChart === c.id ? "text-white shadow-sm" : "bg-muted text-muted-foreground"
            }`}
            style={activeChart === c.id ? { background: c.color } : undefined}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {/* Main Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/40">
            <p className="font-bold mb-1">{current.label} 7 Hari</p>
            <p className="text-xs text-muted-foreground mb-4">Dalam {current.unit}</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={current.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={current.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(60 10% 92%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(216 15% 50%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(216 15% 50%)" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={CUSTOM_TOOLTIP_STYLE}
                  formatter={(v: number) => [`${v} ${current.unit}`, current.label]}
                />
                <Area
                  type="monotone"
                  dataKey={current.key}
                  stroke={current.color}
                  strokeWidth={2.5}
                  fill="url(#chartGrad)"
                  dot={{ fill: current.color, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart Ibadah Persentase */}
          {activeChart === "ibadah" && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/40">
              <p className="font-bold mb-4">Persentase Ibadah Harian</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={data}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(216 15% 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(216 15% 50%)" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Ibadah"]} />
                  <Bar dataKey="ibadah" fill="hsl(129 19% 49%)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Trend Quran */}
          {activeChart === "quran" && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/40">
              <p className="font-bold mb-4">Tren Bacaan Quran</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(60 10% 92%)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(216 15% 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(216 15% 50%)" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v: number) => [`${v} hal`, "Quran"]} />
                  <Line type="monotone" dataKey="quran" stroke="hsl(42 51% 54%)" strokeWidth={2.5} dot={{ fill: "hsl(42 51% 54%)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-3">
            {CHARTS.map(c => {
              const total = data.reduce((s, d) => s + d[c.key], 0);
              const avg = data.length > 0 ? (total / data.length).toFixed(1) : "0";
              const max = data.length > 0 ? Math.max(...data.map(d => d[c.key])).toFixed(1) : "0";
              return (
                <div key={c.id} className="bg-white rounded-2xl p-3 border border-border/40 shadow-sm">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="font-black text-lg mt-0.5" style={{ color: c.color }}>
                    ⌀ {avg}<span className="text-xs font-normal text-muted-foreground ml-0.5">{c.unit}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Maks: {max} {c.unit}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
