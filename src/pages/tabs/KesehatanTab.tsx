import { Lock } from "lucide-react";
import { useHealth } from "@/hooks/useTrackers";

interface KesehatanTabProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

function WaterGlass({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-12 h-14 tap-target"
    >
      <div className={`w-full h-full rounded-b-xl rounded-t-sm border-2 transition-all overflow-hidden ${
        filled ? "border-blue-400" : "border-border"
      }`}>
        {filled && (
          <div
            className="absolute bottom-0 left-0 right-0 animate-[fill_0.3s_ease-out]"
            style={{ background: "var(--gradient-water)", height: "80%" }}
          />
        )}
        <div className={`absolute inset-0 flex items-center justify-center text-lg ${filled ? "opacity-100" : "opacity-30"}`}>
          💧
        </div>
      </div>
    </button>
  );
}

export default function KesehatanTab({ isPremium, onUpgrade }: KesehatanTabProps) {
  const { data, update } = useHealth();

  function toggleGlass(i: number) {
    const newCount = data.gelas_air === i + 1 ? i : i + 1;
    update({ gelas_air: newCount });
  }

  return (
    <div className="space-y-4 pb-2">
      {/* Water Tracker */}
      <div className="mx-4 bg-white rounded-3xl p-5 shadow-sm border border-border/40">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">💧</span>
          <p className="font-bold text-lg">Minum Air</p>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          {data.gelas_air}/8 gelas tercapai
        </p>
        <div className="flex gap-2 justify-between">
          {Array.from({ length: 8 }, (_, i) => (
            <WaterGlass
              key={i}
              filled={i < data.gelas_air}
              onClick={() => toggleGlass(i)}
            />
          ))}
        </div>
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(data.gelas_air / 8) * 100}%`,
              background: "var(--gradient-water)"
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round((data.gelas_air / 8) * 100)}% target harian</p>
      </div>

      {/* Checklist */}
      <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-border/40">
        <p className="font-bold text-sm mb-3">Checklist Kesehatan</p>
        <div className="space-y-2">
          <button
            onClick={() => update({ makan_buah: !data.makan_buah })}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all tap-target ${
              data.makan_buah ? "bg-sage-light" : "bg-muted/30"
            }`}
          >
            <span className="text-xl">🍊</span>
            <span className={`flex-1 text-sm font-medium text-left ${data.makan_buah ? "text-primary line-through opacity-70" : ""}`}>
              Makan Buah
            </span>
            <span className="text-lg">{data.makan_buah ? "✅" : "⬜"}</span>
          </button>
          <button
            onClick={() => update({ olahraga: !data.olahraga })}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all tap-target ${
              data.olahraga ? "bg-sage-light" : "bg-muted/30"
            }`}
          >
            <span className="text-xl">🏃</span>
            <span className={`flex-1 text-sm font-medium text-left ${data.olahraga ? "text-primary line-through opacity-70" : ""}`}>
              Olahraga
            </span>
            <span className="text-lg">{data.olahraga ? "✅" : "⬜"}</span>
          </button>
        </div>
      </div>

      {/* Jam Tidur */}
      <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-border/40">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">😴</span>
            <p className="font-bold text-sm">Jam Tidur</p>
          </div>
          <span className="font-black text-primary text-2xl">{data.jam_tidur}h</span>
        </div>
        <input
          type="range"
          min={4}
          max={12}
          step={0.5}
          value={data.jam_tidur}
          onChange={e => update({ jam_tidur: parseFloat(e.target.value) })}
          className="w-full accent-primary h-2 rounded-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>4 jam</span>
          <span>12 jam</span>
        </div>
        {data.jam_tidur < 6 && (
          <p className="text-xs text-destructive mt-2 font-medium">⚠️ Kurang tidur dapat menurunkan kualitas ibadah</p>
        )}
        {data.jam_tidur >= 7 && (
          <p className="text-xs text-primary mt-2 font-medium">✅ Waktu tidur ideal!</p>
        )}
      </div>

      {/* Summary */}
      <div className="mx-4 bg-muted/40 rounded-2xl p-4 border border-border/40">
        <p className="font-bold text-sm mb-2">Ringkasan Hari Ini</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-black" style={{ color: "hsl(210 90% 55%)" }}>{data.gelas_air}</p>
            <p className="text-xs text-muted-foreground">Gelas air</p>
          </div>
          <div>
            <p className="text-2xl">{data.makan_buah ? "✅" : "❌"}</p>
            <p className="text-xs text-muted-foreground">Buah</p>
          </div>
          <div>
            <p className="text-2xl font-black text-primary">{data.jam_tidur}h</p>
            <p className="text-xs text-muted-foreground">Tidur</p>
          </div>
        </div>
      </div>

      {/* Premium Lock */}
      {!isPremium && (
        <button onClick={onUpgrade} className="mx-4 w-full">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="bg-muted/60 p-4 blur-sm select-none pointer-events-none">
              <p className="font-bold text-sm mb-2">Grafik Kesehatan Mingguan</p>
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
