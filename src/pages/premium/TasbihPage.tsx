import { useState, useEffect, useRef } from "react";

// Dzikir presets
const PRESETS = [
  { name: "Subhanallah", arab: "سُبْحَانَ اللَّهِ", color: "sage" },
  { name: "Alhamdulillah", arab: "اَلْحَمْدُ لِلَّهِ", color: "gold" },
  { name: "Allahu Akbar", arab: "اَللَّهُ أَكْبَرُ", color: "navy" },
  { name: "Lailahaillallah", arab: "لَا إِلَهَ إِلَّا اللَّهُ", color: "primary" },
  { name: "Astaghfirullah", arab: "أَسْتَغْفِرُ اللَّهَ", color: "sage" },
  { name: "Custom", arab: "ذِكْر", color: "muted" },
];

const TARGETS = [33, 99, 100, 1000];

export default function TasbihPage({ onBack }: { onBack: () => void }) {
  const [preset, setPreset] = useState(0);
  const [target, setTarget] = useState(33);
  const [count, setCount] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [vibrate, setVibrate] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const pct = Math.min(100, (count / target) * 100);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const current = PRESETS[preset];

  function tap() {
    setVibrate(true);
    setTimeout(() => setVibrate(false), 80);

    if (count + 1 >= target) {
      setSessions(s => s + 1);
      setCount(0);
      if ("vibrate" in navigator) navigator.vibrate(200);
    } else {
      setCount(c => c + 1);
      if ("vibrate" in navigator) navigator.vibrate(30);
    }
  }

  function reset() { setCount(0); setSessions(0); }

  const bgColor = current.color === "sage" ? "hsl(129 19% 49%)"
    : current.color === "gold" ? "hsl(42 51% 54%)"
    : current.color === "navy" ? "hsl(216 34% 15%)"
    : "hsl(129 19% 49%)";

  return (
    <div className="min-h-full flex flex-col bg-background pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-6 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-muted tap-target">
          <span className="text-lg">←</span>
        </button>
        <div>
          <h1 className="font-black text-xl">Tasbih Digital</h1>
          <p className="text-xs text-muted-foreground">Target: {target}× per sesi</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted-foreground">Sesi selesai</p>
          <p className="font-black text-2xl text-primary">{sessions}</p>
        </div>
      </div>

      {/* Big Counter + Ring */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Progress Ring */}
        <div className="relative w-56 h-56 flex items-center justify-center mb-6">
          <svg width="224" height="224" className="absolute inset-0 -rotate-90">
            <circle cx="112" cy="112" r={radius} fill="none" stroke="hsl(60 10% 90%)" strokeWidth="12" />
            <circle
              cx="112" cy="112" r={radius}
              fill="none"
              stroke={bgColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.3s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <div className="text-center z-10">
            <div className="text-6xl font-black text-foreground leading-none">{count}</div>
            <div className="text-sm text-muted-foreground mt-1">dari {target}</div>
          </div>
        </div>

        {/* Dzikir name */}
        <p className="text-xl font-bold text-foreground mb-1">{current.name}</p>
        <p className="text-2xl font-bold mb-8" style={{ color: bgColor, fontFamily: "serif", direction: "rtl" }}>
          {current.arab}
        </p>

        {/* TAP BUTTON */}
        <button
          ref={btnRef}
          onPointerDown={tap}
          className={`w-48 h-48 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-2xl transition-transform active:scale-95 select-none ${
            vibrate ? "scale-95" : "scale-100"
          }`}
          style={{
            background: `radial-gradient(circle at 35% 35%, ${bgColor}cc, ${bgColor})`,
            boxShadow: `0 20px 60px ${bgColor}55`,
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
        >
          <span className="text-3xl select-none">📿</span>
        </button>

        <p className="text-sm text-muted-foreground mt-6">Tap lingkaran untuk dzikir</p>
      </div>

      {/* Presets */}
      <div className="px-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pilih Dzikir</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => { setPreset(i); reset(); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all tap-target ${
                preset === i ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Target */}
        <div className="mt-3 flex items-center gap-2">
          <p className="text-sm font-semibold mr-1">Target:</p>
          {TARGETS.map(t => (
            <button
              key={t}
              onClick={() => { setTarget(t); reset(); }}
              className={`px-3 py-1 rounded-lg text-sm font-bold tap-target ${
                target === t ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {t}×
            </button>
          ))}
          <button onClick={reset} className="ml-auto text-xs text-destructive font-semibold">Reset</button>
        </div>
      </div>
    </div>
  );
}
