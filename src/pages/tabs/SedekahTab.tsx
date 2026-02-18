import { useState } from "react";
import { Trash2, Plus, Lock } from "lucide-react";
import { useSedekah } from "@/hooks/useTrackers";
import { useAuth } from "@/contexts/AuthContext";
import { guestStorage } from "@/lib/guestStorage";

interface SedekahTabProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000];

function formatRupiah(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

export default function SedekahTab({ isPremium, onUpgrade }: SedekahTabProps) {
  const { profile } = useAuth();
  const { logs, total, addSedekah, deleteSedekah } = useSedekah();
  const [amount, setAmount] = useState<number>(0);
  const [catatan, setCatatan] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const sedekahTarget = profile?.sedekah_target ||
    guestStorage.get<{sedekah_target?: number}>("profile", {}).sedekah_target || 100000;
  const percent = Math.min(100, Math.round((total / sedekahTarget) * 100));

  async function handleAdd() {
    const nominal = amount || parseInt(customAmount) || 0;
    if (!nominal) return;
    await addSedekah(nominal, catatan);
    setAmount(0);
    setCatatan("");
    setCustomAmount("");
    setShowForm(false);
  }

  return (
    <div className="space-y-4 pb-2">
      {/* Target Card */}
      <div
        className="mx-4 rounded-3xl p-5 text-white"
        style={{ background: "var(--gradient-sage)" }}
      >
        <p className="text-white/70 text-sm">Target Sedekah Ramadhan</p>
        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="text-3xl font-black">{formatRupiah(total)}</p>
            <p className="text-white/60 text-sm">dari {formatRupiah(sedekahTarget)}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black">{percent}%</div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Quick Add */}
      <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-border/40">
        <p className="font-bold text-sm mb-3">Tambah Sedekah Cepat</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {QUICK_AMOUNTS.map(n => (
            <button
              key={n}
              onClick={() => { setAmount(n); setShowForm(true); }}
              className={`py-2 rounded-xl font-semibold text-xs tap-target transition-all ${
                amount === n ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {formatRupiah(n)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-primary text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nominal Custom
        </button>

        {showForm && (
          <div className="mt-3 space-y-3 animate-fade-in">
            <input
              type="number"
              placeholder="Nominal (Rp)"
              value={customAmount || amount || ""}
              onChange={e => { setCustomAmount(e.target.value); setAmount(0); }}
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Catatan (opsional)"
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleAdd}
              className="w-full h-11 rounded-xl font-bold text-white"
              style={{ background: "var(--gradient-sage)" }}
            >
              Catat Sedekah 💚
            </button>
          </div>
        )}
      </div>

      {/* Log */}
      <div className="mx-4">
        <p className="font-bold text-sm mb-2 px-1">Riwayat Sedekah</p>
        {logs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-border/40 shadow-sm">
            <p className="text-4xl mb-2">💚</p>
            <p className="text-muted-foreground text-sm">Belum ada catatan sedekah</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/40 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  💚
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">{formatRupiah(log.nominal)}</p>
                  {log.catatan && <p className="text-xs text-muted-foreground truncate">{log.catatan}</p>}
                  <p className="text-xs text-muted-foreground">{log.tanggal}</p>
                </div>
                <button
                  onClick={() => deleteSedekah(log.id)}
                  className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors tap-target"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Premium Lock */}
      {!isPremium && (
        <button onClick={onUpgrade} className="mx-4 w-full">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="bg-muted/60 p-4 blur-sm select-none pointer-events-none">
              <p className="font-bold text-sm mb-2">Grafik Akumulasi Sedekah</p>
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
