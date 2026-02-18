import { useState } from "react";
import { Crown, BookOpen, Compass, BarChart3, FileText, Lock } from "lucide-react";
import TasbihPage from "./TasbihPage";
import DoaPage from "./DoaPage";
import ChartsPage from "./ChartsPage";
import ExportPage from "./ExportPage";
import { useAuth } from "@/contexts/AuthContext";

interface PremiumHubProps {
  onBack: () => void;
  onUpgrade: () => void;
  displayName: string;
}

const FEATURES = [
  {
    id: "tasbih",
    title: "Tasbih Digital",
    desc: "Counter dzikir dengan preset & progress ring",
    icon: "📿",
    color: "bg-primary/10 text-primary",
    gradient: "var(--gradient-sage)",
  },
  {
    id: "doa",
    title: "Koleksi Doa",
    desc: "Doa Ramadhan lengkap + bookmark + search",
    icon: "📖",
    color: "bg-gold/10 text-gold-dark",
    gradient: "var(--gradient-gold)",
  },
  {
    id: "charts",
    title: "Statistik Mingguan",
    desc: "Grafik perkembangan ibadah 7 hari terakhir",
    icon: "📊",
    color: "bg-navy/10 text-navy",
    gradient: "linear-gradient(135deg, hsl(216 34% 15%), hsl(216 30% 28%))",
  },
  {
    id: "export",
    title: "Export PDF",
    desc: "Download laporan ibadah dalam format PDF",
    icon: "📄",
    color: "bg-sage-light text-sage-dark",
    gradient: "linear-gradient(135deg, hsl(129 25% 55%), hsl(129 30% 65%))",
  },
];

export default function PremiumHub({ onBack, onUpgrade, displayName }: PremiumHubProps) {
  const { isPremium } = useAuth();
  const [active, setActive] = useState<string | null>(null);

  if (active === "tasbih") return <TasbihPage onBack={() => setActive(null)} />;
  if (active === "doa") return <DoaPage onBack={() => setActive(null)} />;
  if (active === "charts") return <ChartsPage onBack={() => setActive(null)} />;
  if (active === "export") return <ExportPage onBack={() => setActive(null)} displayName={displayName} />;

  return (
    <div className="min-h-full bg-background pb-8">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-8 text-white relative overflow-hidden"
        style={{ background: "var(--gradient-gold)" }}
      >
        <div className="absolute inset-0 islamic-pattern opacity-20 pointer-events-none" />
        <button onClick={onBack} className="text-white/70 text-sm mb-4 relative">← Kembali</button>
        <div className="relative flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-sm">Fitur Eksklusif</p>
            <h1 className="text-2xl font-black">Premium Hub</h1>
          </div>
        </div>
        {isPremium && (
          <div className="relative mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <span className="text-white text-xs font-bold">✨ Akun Premium Aktif</span>
          </div>
        )}
      </div>

      {/* Feature Grid */}
      <div className="px-4 -mt-4">
        <div className="space-y-3">
          {FEATURES.map(feat => (
            <button
              key={feat.id}
              onClick={() => {
                if (!isPremium && feat.id !== "doa") {
                  onUpgrade();
                  return;
                }
                setActive(feat.id);
              }}
              className="w-full relative"
            >
              <div className="bg-white rounded-2xl p-4 border border-border/40 shadow-sm flex items-center gap-4 text-left tap-target">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: feat.gradient }}
                >
                  {feat.icon}
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base text-foreground">{feat.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{feat.desc}</p>
                </div>
                {/* Lock or Arrow */}
                {!isPremium && feat.id !== "doa" ? (
                  <div className="flex-shrink-0 w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gold-dark" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 text-muted-foreground text-lg">›</div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Upgrade CTA for free users */}
        {!isPremium && (
          <button
            onClick={onUpgrade}
            className="mt-4 w-full rounded-2xl p-4 text-white text-center"
            style={{ background: "var(--gradient-gold)" }}
          >
            <p className="font-black text-lg">Buka Semua Fitur Premium</p>
            <p className="text-white/70 text-sm mt-0.5">Aktivasi dengan kode donasi Saweria/Trakteer</p>
          </button>
        )}
      </div>
    </div>
  );
}
