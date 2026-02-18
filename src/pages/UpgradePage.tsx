import { useState, useEffect } from "react";
import { Crown, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UpgradePageProps {
  onBack: () => void;
}

interface Config {
  premium_price: string;
  premium_tagline: string;
  saweria_link: string;
  trakteer_link: string;
  premium_feature_1: string;
  premium_feature_2: string;
  premium_feature_3: string;
  premium_feature_4: string;
  premium_feature_5: string;
}

function Confetti() {
  const items = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: ["#C9A84C", "#6B8F71", "#1A2332", "#f59e0b", "#10b981"][i % 5],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${0.8 + Math.random() * 0.8}s`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {items.map(item => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: item.left,
            top: "-20px",
            width: "8px",
            height: "8px",
            background: item.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confetti-fall ${item.duration} ${item.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function UpgradePage({ onBack }: UpgradePageProps) {
  const { user, refreshProfile } = useAuth();
  const [config, setConfig] = useState<Partial<Config>>({});
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const features = config
    ? Object.keys(config)
        .filter(k => k.startsWith("premium_feature_"))
        .map(k => config[k as keyof Config])
    : [];

  useEffect(() => {
    supabase.from("app_config").select("key,value").then(({ data }) => {
      if (data) {
        const cfg: Record<string, string> = {};
        data.forEach(r => { cfg[r.key] = r.value; });
        setConfig(cfg as unknown as Config);
      }
    });
  }, []);

  async function handleActivate() {
    if (!code.trim()) return toast.error("Masukkan kode aktivasi");
    if (!user) return toast.error("Login terlebih dahulu untuk aktivasi premium");
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-activation-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowConfetti(true);
        toast.success(data.message || "Upgrade berhasil! 🎉");
        await refreshProfile();
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        toast.error(data.error || "Kode tidak valid");
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-full bg-background pb-8">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div
        className="px-4 pt-6 pb-8 text-white relative overflow-hidden"
        style={{ background: "var(--gradient-gold)" }}
      >
        <button onClick={onBack} className="text-white/70 text-sm mb-4">← Kembali</button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-sm">Ramadhan Tracker</p>
            <h1 className="text-2xl font-black">Upgrade Premium</h1>
          </div>
        </div>
        <p className="text-white/80 text-sm">
          {config.premium_tagline || "Maksimalkan ibadah Ramadhan-mu"}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-white font-bold">Hanya Rp {Number(config.premium_price || 25000).toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-border/40">
          <p className="font-bold text-base mb-4">Yang Kamu Dapatkan:</p>
          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Buttons */}
      <div className="px-4 mt-4 space-y-3">
        <p className="text-xs text-muted-foreground text-center font-medium">Cara berdonasi:</p>
        {config.saweria_link && (
          <a
            href={config.saweria_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full h-12 rounded-2xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FF6B35, #FF9A3C)" }}
          >
            ☕ Donasi via Saweria
          </a>
        )}
        {config.trakteer_link && (
          <a
            href={config.trakteer_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full h-12 rounded-2xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #e63946, #f4a261)" }}
          >
            ❤️ Donasi via Trakteer
          </a>
        )}
      </div>

      {/* Activation Code */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/40">
          <p className="font-bold text-sm mb-1">Sudah Bayar? Masukkan Kode Aktivasi</p>
          <p className="text-xs text-muted-foreground mb-3">Kode dikirim ke email setelah donasi dikonfirmasi</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="XXXX-XXXX"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="flex-1 h-11 rounded-xl border border-border px-3 font-mono font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleActivate}
              disabled={loading}
              className="px-4 h-11 rounded-xl font-bold text-white flex items-center gap-2"
              style={{ background: "var(--gradient-sage)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aktivasi"}
            </button>
          </div>
          {!user && (
            <p className="text-xs text-destructive mt-2">⚠️ Login terlebih dahulu untuk aktivasi</p>
          )}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="px-4 mt-4">
        <div className="bg-sage-light/50 rounded-2xl p-4 text-center">
          <p className="text-sage-dark text-xs">
            🔒 Pembayaran aman · Akses seumur hidup · Tidak ada langganan bulanan
          </p>
        </div>
      </div>
    </div>
  );
}
