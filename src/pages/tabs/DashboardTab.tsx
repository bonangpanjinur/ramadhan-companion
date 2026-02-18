import { useState, useEffect } from "react";
import { Settings, Crown, Clock, Flame, BookOpen, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { guestStorage } from "@/lib/guestStorage";
import { useIbadah } from "@/hooks/useTrackers";
import { supabase } from "@/integrations/supabase/client";

interface PrayerTime {
  name: string;
  time: string;
  passed: boolean;
}

interface DashboardProps {
  onNavigate: (tab: string) => void;
  isPremium: boolean;
  guestProfile?: { display_name: string; sedekah_target: number };
}

function CircleProgress({ percent }: { percent: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent < 40 ? "#ef4444" : percent < 70 ? "#C9A84C" : "#6B8F71";

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg width="160" height="160" className="absolute inset-0 -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(60 10% 90%)" strokeWidth="10" />
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-circle"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.5s" }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-black text-foreground">{percent}%</div>
        <div className="text-xs text-muted-foreground font-medium">ibadah hari ini</div>
      </div>
    </div>
  );
}

function GreetingCard({ name, ramadhanDay }: { name: string; ramadhanDay: number }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div
      className="mx-4 rounded-3xl p-5 text-white relative overflow-hidden"
      style={{ background: "var(--gradient-greeting)" }}
    >
      <div className="absolute inset-0 islamic-pattern opacity-20 pointer-events-none" />
      <div className="relative z-10">
        <p className="text-white/60 text-sm font-medium">{getGreeting()},</p>
        <h2 className="text-xl font-bold mt-0.5">Assalamu'alaikum, {name}! 🌙</h2>
        <div className="mt-3 flex items-center gap-2">
          <div className="bg-gold/20 border border-gold/30 rounded-full px-3 py-1">
            <span className="text-gold font-bold text-sm">Hari ke-{ramadhanDay} Ramadhan</span>
          </div>
        </div>
        <p className="text-white/50 text-xs mt-2">Semoga ibadahmu hari ini diterima Allah ✨</p>
      </div>
    </div>
  );
}

export default function DashboardTab({ onNavigate, isPremium, guestProfile }: DashboardProps) {
  const { profile } = useAuth();
  const { percent, done, total } = useIbadah();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [streak, setStreak] = useState(0);
  const [sedekahTotal, setSedekahTotal] = useState(0);
  const [quranTotal, setQuranTotal] = useState(0);

  const displayName = profile?.display_name || guestProfile?.display_name || "Sahabat";
  const ramadhanDay = profile?.ramadhan_day || guestProfile ? 
    (guestStorage.get<{ramadhan_day?: number}>("profile", {}).ramadhan_day || 1) : 1;
  const sedekahTarget = profile?.sedekah_target || guestProfile?.sedekah_target || 100000;

  useEffect(() => {
    // Fetch prayer times from Aladhan API
    const fetchPrayers = async () => {
      try {
        const date = new Date();
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${d}-${m}-${y}?city=Jakarta&country=Indonesia&method=20`);
        const json = await res.json();
        if (json.data?.timings) {
          const t = json.data.timings;
          const now = date.getHours() * 60 + date.getMinutes();
          const prayers: PrayerTime[] = [
            { name: "Subuh", time: t.Fajr, passed: false },
            { name: "Dzuhur", time: t.Dhuhr, passed: false },
            { name: "Ashar", time: t.Asr, passed: false },
            { name: "Maghrib", time: t.Maghrib, passed: false },
            { name: "Isya", time: t.Isha, passed: false },
          ].map(p => {
            const [h, min] = p.time.split(":").map(Number);
            const pMinutes = h * 60 + min;
            return { ...p, passed: now > pMinutes };
          });
          setPrayerTimes(prayers);
          setNextPrayer(prayers.find(p => !p.passed) || prayers[0]);
        }
      } catch { /* use fallback */ }
    };
    fetchPrayers();
  }, []);

  return (
    <div className="space-y-4 pb-2">
      <GreetingCard name={displayName} ramadhanDay={ramadhanDay} />

      {/* Circle Progress */}
      <div className="mx-4 bg-white rounded-3xl p-6 shadow-sm border border-border/40">
        <div className="flex items-center gap-6">
          <CircleProgress percent={percent} />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Ibadah selesai</p>
              <p className="text-2xl font-black text-foreground">{done}/{total}</p>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-gold animate-flame" />
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="font-bold text-gold">{streak} hari</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("ibadah")}
              className="text-xs font-semibold text-primary underline underline-offset-2"
            >
              Lihat detail →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mx-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("quran")}
          className="bg-white rounded-2xl p-4 shadow-sm border border-border/40 text-left tap-target"
        >
          <BookOpen className="w-5 h-5 text-gold mb-2" />
          <p className="text-xs text-muted-foreground">Quran hari ini</p>
          <p className="text-xl font-black text-foreground">{quranTotal} hal</p>
        </button>
        <button
          onClick={() => onNavigate("sedekah")}
          className="bg-white rounded-2xl p-4 shadow-sm border border-border/40 text-left tap-target"
        >
          <Heart className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Total Sedekah</p>
          <p className="text-xl font-black text-foreground">
            Rp {(sedekahTotal / 1000).toFixed(0)}rb
          </p>
        </button>
      </div>

      {/* Prayer Times */}
      {nextPrayer && (
        <div className="mx-4 rounded-2xl p-4 border border-border/40 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <p className="font-semibold text-sm">Sholat Berikutnya</p>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-black text-primary">{nextPrayer.name}</p>
              <p className="text-muted-foreground text-sm">{nextPrayer.time} WIB</p>
            </div>
            <div className="text-right">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {prayerTimes.map((p) => (
              <div
                key={p.name}
                className={`flex-1 text-center py-1 rounded-lg text-xs font-medium ${
                  p.passed ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                } ${nextPrayer?.name === p.name ? "ring-2 ring-primary" : ""}`}
              >
                {p.name.slice(0, 3)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade Banner */}
      {!isPremium && (
        <button
          onClick={() => onNavigate("upgrade")}
          className="mx-4 w-full rounded-2xl p-4 text-left relative overflow-hidden"
          style={{ background: "var(--gradient-gold)" }}
        >
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-white flex-shrink-0" />
            <div>
              <p className="text-white font-bold">Upgrade ke Premium</p>
              <p className="text-white/70 text-xs">Buka tasbih digital, grafik statistik & export PDF</p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
