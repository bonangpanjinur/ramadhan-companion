import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useIbadah } from "@/hooks/useTrackers";
import type { GuestIbadah } from "@/lib/guestStorage";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

const SHOLAT_WAJIB: { key: keyof GuestIbadah; label: string; emoji: string }[] = [
  { key: "subuh", label: "Sholat Subuh", emoji: "🌅" },
  { key: "dzuhur", label: "Sholat Dzuhur", emoji: "☀️" },
  { key: "ashar", label: "Sholat Ashar", emoji: "🌤️" },
  { key: "maghrib", label: "Sholat Maghrib", emoji: "🌆" },
  { key: "isya", label: "Sholat Isya", emoji: "🌙" },
];

const SHOLAT_SUNNAH: { key: keyof GuestIbadah; label: string; emoji: string }[] = [
  { key: "tahajud", label: "Tahajud", emoji: "⭐" },
  { key: "dhuha", label: "Dhuha", emoji: "🌞" },
  { key: "rawatib", label: "Rawatib", emoji: "📿" },
  { key: "witir", label: "Witir", emoji: "✨" },
];

const AMALAN_HARIAN: { key: keyof GuestIbadah; label: string; emoji: string }[] = [
  { key: "tadarus", label: "Tadarus Al-Quran", emoji: "📖" },
  { key: "sahur", label: "Sahur", emoji: "🍽️" },
  { key: "buka_tepat_waktu", label: "Buka Tepat Waktu", emoji: "⏰" },
];

interface CheckItemProps {
  emoji: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}

function CheckItem({ emoji, label, checked, onToggle }: CheckItemProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 w-full py-3 px-4 rounded-2xl transition-all tap-target"
      style={{ background: checked ? "hsl(129 24% 92%)" : "white" }}
    >
      <span className="text-xl">{emoji}</span>
      <span className={`flex-1 text-sm font-medium text-left ${checked ? "text-primary line-through opacity-70" : "text-foreground"}`}>
        {label}
      </span>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${checked ? "animate-bounce-check" : ""}`}>
        {checked
          ? <CheckCircle2 className="w-7 h-7 text-primary" />
          : <Circle className="w-7 h-7 text-border" />
        }
      </div>
    </button>
  );
}

export default function IbadahTab() {
  const [offset, setOffset] = useState(0);
  const dateObj = addDays(new Date(), offset);
  const dateKey = toDateKey(dateObj);
  const { data, toggle, done, total, percent } = useIbadah(dateKey);

  const isToday = offset === 0;
  const dateLabel = isToday
    ? "Hari Ini"
    : offset === -1
    ? "Kemarin"
    : offset === 1
    ? "Besok"
    : dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long" });

  return (
    <div className="space-y-4 pb-2">
      {/* Date Navigator */}
      <div className="mx-4 flex items-center justify-between bg-white rounded-2xl p-3 shadow-sm border border-border/40">
        <button onClick={() => setOffset(o => o - 1)} className="tap-target p-2 rounded-xl hover:bg-muted">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-bold text-foreground">{dateLabel}</p>
          <p className="text-xs text-muted-foreground">
            {dateObj.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button
          onClick={() => setOffset(o => o + 1)}
          className="tap-target p-2 rounded-xl hover:bg-muted"
          disabled={offset >= 0}
        >
          <ChevronRight className={`w-5 h-5 ${offset >= 0 ? "opacity-30" : ""}`} />
        </button>
      </div>

      {/* Progress */}
      <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-border/40">
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-sm">Progress Ibadah</span>
          <span className="font-black text-primary">{done}/{total}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2 text-right text-xs text-muted-foreground font-medium">{percent}% selesai</div>
      </div>

      {/* Sholat Wajib */}
      <div className="mx-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">🕌 Sholat Wajib</p>
        <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden divide-y divide-border/30">
          {SHOLAT_WAJIB.map(item => (
            <CheckItem
              key={item.key}
              emoji={item.emoji}
              label={item.label}
              checked={data[item.key]}
              onToggle={() => toggle(item.key)}
            />
          ))}
        </div>
      </div>

      {/* Sholat Sunnah */}
      <div className="mx-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">⭐ Sholat Sunnah</p>
        <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden divide-y divide-border/30">
          {SHOLAT_SUNNAH.map(item => (
            <CheckItem
              key={item.key}
              emoji={item.emoji}
              label={item.label}
              checked={data[item.key]}
              onToggle={() => toggle(item.key)}
            />
          ))}
        </div>
      </div>

      {/* Amalan Harian */}
      <div className="mx-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">📿 Amalan Harian</p>
        <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden divide-y divide-border/30">
          {AMALAN_HARIAN.map(item => (
            <CheckItem
              key={item.key}
              emoji={item.emoji}
              label={item.label}
              checked={data[item.key]}
              onToggle={() => toggle(item.key)}
            />
          ))}
        </div>
      </div>

      {/* 30-Day Calendar Mini */}
      <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-border/40">
        <p className="font-bold text-sm mb-3">Kalender Ramadhan</p>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 30 }, (_, i) => {
            const day = i + 1;
            const isCurrent = day === (isToday ? dateObj.getDate() : -1);
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : day < dateObj.getDate() || !isToday
                    ? "bg-sage-light text-sage-dark"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
