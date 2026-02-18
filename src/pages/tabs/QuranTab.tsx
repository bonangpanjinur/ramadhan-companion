import { useState } from "react";
import { Lock } from "lucide-react";
import { useQuranProgress } from "@/hooks/useTrackers";
import { useAuth } from "@/contexts/AuthContext";
import { guestStorage } from "@/lib/guestStorage";

const TOTAL_PAGES = 604;

interface QuranTabProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

type JuzStatus = "belum" | "proses" | "selesai";

export default function QuranTab({ isPremium, onUpgrade }: QuranTabProps) {
  const { profile } = useAuth();
  const { todayPages, totalPages, addPages } = useQuranProgress();
  const [juzStatus, setJuzStatus] = useState<JuzStatus[]>(
    Array(30).fill("belum" as JuzStatus)
  );
  const [customInput, setCustomInput] = useState("");
  const [divideByPrayer, setDivideByPrayer] = useState(false);

  const quranTarget = profile?.quran_target || guestStorage.get<{quran_target?: number}>("profile", {}).quran_target || 1;
  const ramadhanDay = profile?.ramadhan_day || guestStorage.get<{ramadhan_day?: number}>("profile", {}).ramadhan_day || 1;
  const remaining = Math.max(0, 30 - ramadhanDay + 1);
  const targetTotal = TOTAL_PAGES * quranTarget;
  const pagesPerDay = remaining > 0 ? Math.ceil((targetTotal - totalPages) / remaining) : 0;
  const pagesPerPrayer = Math.ceil(pagesPerDay / 5);
  const progressPercent = Math.min(100, Math.round((totalPages / targetTotal) * 100));

  function cycleJuz(i: number) {
    const next: JuzStatus = juzStatus[i] === "belum" ? "proses" : juzStatus[i] === "proses" ? "selesai" : "belum";
    const updated = [...juzStatus];
    updated[i] = next;
    setJuzStatus(updated);
  }

  return (
    <div className="space-y-4 pb-2">
      {/* Calculator Card */}
      <div
        className="mx-4 rounded-3xl p-5 text-white"
        style={{ background: "var(--gradient-hero)" }}
      >
        <p className="text-white/60 text-sm">Target: {quranTarget}x khatam</p>
        <div className="mt-2 flex justify-between items-end">
          <div>
            <p className="text-white/60 text-xs">Hari ini perlu</p>
            <p className="text-4xl font-black">
              {divideByPrayer ? pagesPerPrayer : pagesPerDay}
            </p>
            <p className="text-white/60 text-sm">{divideByPrayer ? "halaman/sholat" : "halaman/hari"}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Sudah dibaca</p>
            <p className="text-2xl font-bold">{totalPages}</p>
            <p className="text-white/60 text-xs">dari {targetTotal} hal</p>
          </div>
        </div>

        {/* Toggle per prayer */}
        <button
          onClick={() => setDivideByPrayer(!divideByPrayer)}
          className={`mt-3 text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
            divideByPrayer ? "bg-gold text-navy" : "bg-white/20 text-white"
          }`}
        >
          {divideByPrayer ? "📿 Per sholat aktif" : "Bagi per sholat"}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-border/40">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold">Progress Total</span>
          <span className="font-black text-primary">{progressPercent}%</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%`, background: "var(--gradient-sage)" }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{totalPages} / {targetTotal} halaman</p>
      </div>

      {/* Add Pages */}
      <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-border/40">
        <p className="font-bold text-sm mb-3">Tambah Halaman Hari Ini</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[5, 10, 20, 30].map(n => (
            <button
              key={n}
              onClick={() => addPages(n)}
              className="py-2 rounded-xl bg-sage-light text-sage-dark font-bold text-sm tap-target"
            >
              +{n}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Custom..."
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            className="flex-1 h-10 rounded-xl border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => {
              const n = parseInt(customInput);
              if (n > 0) { addPages(n); setCustomInput(""); }
            }}
            className="px-4 h-10 rounded-xl font-bold text-sm text-white"
            style={{ background: "var(--gradient-sage)" }}
          >
            Tambah
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-muted-foreground">Hari ini: </span>
          <span className="text-xs font-bold text-primary">{todayPages} halaman</span>
        </div>
      </div>

      {/* Juz Grid */}
      <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-border/40">
        <p className="font-bold text-sm mb-3">Grid 30 Juz</p>
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: 30 }, (_, i) => {
            const s = juzStatus[i];
            const bg = s === "selesai" ? "bg-primary text-primary-foreground" : s === "proses" ? "bg-gold/20 text-gold-dark" : "bg-muted text-muted-foreground";
            const icon = s === "selesai" ? "✅" : s === "proses" ? "🔄" : "";
            return (
              <button
                key={i}
                onClick={() => cycleJuz(i)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold tap-target ${bg} transition-all`}
              >
                <span className="text-xs">{icon || (i + 1)}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
          <span>⬜ Belum</span>
          <span>🔄 Proses</span>
          <span>✅ Selesai</span>
        </div>
      </div>

      {/* Premium Lock */}
      {!isPremium && (
        <button onClick={onUpgrade} className="mx-4 w-full">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="bg-muted/60 p-4 blur-sm select-none pointer-events-none">
              <p className="font-bold text-sm mb-2">Grafik Perkembangan Quran</p>
              <div className="h-24 bg-muted rounded-xl" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/50 backdrop-blur-sm rounded-2xl">
              <Lock className="w-8 h-8 text-gold mb-2" />
              <p className="text-white font-bold text-sm">Fitur Premium</p>
              <p className="text-white/60 text-xs">Tap untuk upgrade</p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
