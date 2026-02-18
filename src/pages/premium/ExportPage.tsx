import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { guestStorage, getTodayKey } from "@/lib/guestStorage";
import { FileText, Loader2, CheckSquare, BookOpen, Heart, Activity } from "lucide-react";
import { toast } from "sonner";

// Dynamically import jsPDF to keep bundle size manageable
async function generatePDF(
  sections: string[],
  user: { id: string } | null,
  displayName: string
) {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = 210;
  const margin = 20;
  let y = margin;

  function header() {
    doc.setFillColor(26, 35, 50); // navy
    doc.rect(0, 0, pageW, 40, "F");
    doc.setTextColor(201, 168, 76); // gold
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("🌙 Ramadhan Tracker", margin, 20);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Laporan Ibadah — ${displayName}`, margin, 30);
    doc.text(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), 150, 30, { align: "right" });
    y = 55;
  }

  function sectionTitle(title: string, color: [number, number, number]) {
    doc.setFillColor(...color);
    doc.roundedRect(margin, y, pageW - margin * 2, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 5, y + 7);
    y += 15;
    doc.setTextColor(0, 0, 0);
  }

  function row(label: string, value: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(label, margin + 5, y);
    doc.setFont("helvetica", "bold");
    doc.text(value, pageW - margin - 5, y, { align: "right" });
    y += 6;
  }

  function spacer(n = 4) { y += n; }

  header();

  // ── IBADAH ──────────────────────────────────────
  if (sections.includes("ibadah")) {
    sectionTitle("📿 Ibadah", [107, 143, 113]); // sage

    let ibadahData: Record<string, boolean> = {};
    if (user) {
      const today = getTodayKey();
      const { data } = await supabase.from("daily_ibadah").select("*").eq("user_id", user.id).eq("tanggal", today).single();
      if (data) ibadahData = data as unknown as Record<string, boolean>;
    } else {
      ibadahData = guestStorage.get<Record<string, boolean>>(`ibadah_${getTodayKey()}`, {});
    }

    const ibadahFields: [string, string][] = [
      ["Subuh", "subuh"], ["Dzuhur", "dzuhur"], ["Ashar", "ashar"],
      ["Maghrib", "maghrib"], ["Isya", "isya"], ["Tahajud", "tahajud"],
      ["Dhuha", "dhuha"], ["Rawatib", "rawatib"], ["Witir", "witir"],
      ["Tadarus", "tadarus"], ["Sahur", "sahur"], ["Buka Tepat Waktu", "buka_tepat_waktu"],
    ];
    const done = ibadahFields.filter(([, k]) => ibadahData[k]).length;
    row("Total Selesai", `${done} / ${ibadahFields.length}`);
    row("Persentase", `${Math.round((done / ibadahFields.length) * 100)}%`);
    ibadahFields.forEach(([label, key]) => {
      row(label, ibadahData[key] ? "✓ Selesai" : "○ Belum");
    });
    spacer();
  }

  // ── QURAN ──────────────────────────────────────
  if (sections.includes("quran")) {
    sectionTitle("📖 Al-Quran", [201, 168, 76]); // gold

    let totalHalaman = 0;
    if (user) {
      const { data } = await supabase.from("quran_progress").select("halaman_dibaca").eq("user_id", user.id);
      totalHalaman = (data || []).reduce((s, r) => s + r.halaman_dibaca, 0);
    } else {
      totalHalaman = guestStorage.get<number>("quran_total", 0);
    }

    row("Total Halaman Dibaca", `${totalHalaman} hal`);
    row("Progress Khatam", `${Math.min(100, Math.round((totalHalaman / 604) * 100))}%`);
    row("Sisa Halaman", `${Math.max(0, 604 - totalHalaman)} hal`);
    spacer();
  }

  // ── SEDEKAH ──────────────────────────────────────
  if (sections.includes("sedekah")) {
    sectionTitle("💚 Sedekah", [26, 35, 50]); // navy

    let totalSedekah = 0;
    let countSedekah = 0;
    if (user) {
      const { data } = await supabase.from("sedekah_log").select("nominal").eq("user_id", user.id);
      totalSedekah = (data || []).reduce((s, r) => s + Number(r.nominal), 0);
      countSedekah = (data || []).length;
    } else {
      const logs = guestStorage.get<{nominal: number}[]>("sedekah_logs", []);
      totalSedekah = logs.reduce((s, l) => s + l.nominal, 0);
      countSedekah = logs.length;
    }

    row("Total Sedekah", `Rp ${totalSedekah.toLocaleString("id-ID")}`);
    row("Jumlah Transaksi", `${countSedekah} kali`);
    row("Rata-rata per Hari", `Rp ${Math.round(totalSedekah / 30).toLocaleString("id-ID")}`);
    spacer();
  }

  // ── KESEHATAN ──────────────────────────────────────
  if (sections.includes("kesehatan")) {
    sectionTitle("🏃 Kesehatan", [80, 140, 180]);

    let healthData = { gelas_air: 0, makan_buah: false, olahraga: false, jam_tidur: 7 };
    if (user) {
      const { data } = await supabase.from("health_tracker").select("*").eq("user_id", user.id).eq("tanggal", getTodayKey()).single();
      if (data) healthData = { gelas_air: data.gelas_air, makan_buah: data.makan_buah, olahraga: data.olahraga, jam_tidur: Number(data.jam_tidur) };
    } else {
      healthData = guestStorage.get(`health_${getTodayKey()}`, healthData);
    }

    row("Gelas Air", `${healthData.gelas_air} / 8 gelas`);
    row("Makan Buah", healthData.makan_buah ? "✓ Ya" : "○ Belum");
    row("Olahraga", healthData.olahraga ? "✓ Ya" : "○ Belum");
    row("Jam Tidur", `${healthData.jam_tidur} jam`);
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Ramadhan Tracker — Laporan Ibadah", margin, 290);
    doc.text(`Halaman ${i} dari ${totalPages}`, pageW - margin, 290, { align: "right" });
  }

  doc.save(`Laporan-Ramadhan-${displayName.replace(/\s/g, "-")}.pdf`);
}

const SECTIONS = [
  { id: "ibadah", label: "Ibadah Harian", icon: CheckSquare, color: "bg-primary/10 text-primary" },
  { id: "quran", label: "Progress Quran", icon: BookOpen, color: "bg-gold/10 text-gold-dark" },
  { id: "sedekah", label: "Riwayat Sedekah", icon: Heart, color: "bg-navy/10 text-navy" },
  { id: "kesehatan", label: "Data Kesehatan", icon: Activity, color: "bg-sage-light text-sage-dark" },
];

export default function ExportPage({ onBack, displayName }: { onBack: () => void; displayName: string }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>(["ibadah", "quran", "sedekah", "kesehatan"]);
  const [loading, setLoading] = useState(false);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  async function handleExport() {
    if (selected.length === 0) return toast.error("Pilih minimal 1 kategori");
    setLoading(true);
    try {
      await generatePDF(selected, user, displayName);
      toast.success("PDF berhasil didownload! 📄");
    } catch (e) {
      toast.error("Gagal generate PDF");
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-full flex flex-col bg-background pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-muted tap-target text-lg">←</button>
        <div>
          <h1 className="font-black text-xl">📄 Export Laporan PDF</h1>
          <p className="text-xs text-muted-foreground">Pilih kategori yang ingin diexport</p>
        </div>
      </div>

      {/* Preview */}
      <div className="mx-4 mb-4 rounded-2xl overflow-hidden border-2 border-dashed border-border">
        <div className="bg-navy p-4 text-white">
          <p className="font-black text-base">🌙 Ramadhan Tracker</p>
          <p className="text-white/60 text-xs">Laporan Ibadah — {displayName}</p>
          <p className="text-white/40 text-xs">{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="bg-cream p-3 text-xs text-muted-foreground">
          {selected.length > 0
            ? selected.map(s => SECTIONS.find(sec => sec.id === s)?.label).join(" • ")
            : "Pilih minimal 1 kategori"
          }
        </div>
      </div>

      {/* Section Selector */}
      <div className="px-4 space-y-2 flex-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Pilih Kategori</p>
        {SECTIONS.map(sec => {
          const Icon = sec.icon;
          const isSelected = selected.includes(sec.id);
          return (
            <button
              key={sec.id}
              onClick={() => toggle(sec.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all tap-target ${
                isSelected ? "border-primary bg-primary/5" : "border-border bg-white"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sec.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex-1 font-semibold text-sm text-left">{sec.label}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? "border-primary bg-primary" : "border-border"
              }`}>
                {isSelected && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Export Button */}
      <div className="px-4 mt-6">
        <button
          onClick={handleExport}
          disabled={loading || selected.length === 0}
          className="w-full h-14 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 disabled:opacity-50"
          style={{ background: "var(--gradient-hero)" }}
        >
          {loading
            ? <Loader2 className="w-6 h-6 animate-spin" />
            : <>
                <FileText className="w-6 h-6" />
                Download PDF
              </>
          }
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {selected.length} kategori dipilih · Data hari ini
        </p>
      </div>
    </div>
  );
}
