import { useState, useEffect } from "react";
import { User, Edit3, BookOpen, Heart, LogOut, Check, X, TrendingUp, CheckSquare, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { guestStorage } from "@/lib/guestStorage";

interface ProfileTabProps {
  onUpgrade: () => void;
  guestProfile?: { display_name: string; ramadhan_day: number; quran_target: number; sedekah_target: number } | null;
  onGuestLogout?: () => void;
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function ProfileTab({ onUpgrade, guestProfile, onGuestLogout }: ProfileTabProps) {
  const { user, profile, signOut, refreshProfile, isPremium } = useAuth();

  // Edit states
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [editQuran, setEditQuran] = useState(false);
  const [quranVal, setQuranVal] = useState(1);
  const [editSedekah, setEditSedekah] = useState(false);
  const [sedekahVal, setSedekahVal] = useState(100000);
  const [saving, setSaving] = useState(false);

  // Monthly recap
  const [monthStats, setMonthStats] = useState<{
    totalIbadahDays: number;
    avgIbadahPct: number;
    totalQuranPages: number;
    totalSedekah: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const displayName = profile?.display_name || guestProfile?.display_name || "Sahabat";
  const quranTarget = profile?.quran_target ?? guestProfile?.quran_target ?? 1;
  const sedekahTarget = profile?.sedekah_target ?? guestProfile?.sedekah_target ?? 100000;

  useEffect(() => {
    setNameVal(displayName);
    setQuranVal(quranTarget);
    setSedekahVal(sedekahTarget);
  }, [profile, guestProfile]);

  // Load monthly stats
  useEffect(() => {
    if (!user) {
      // Guest: read from localStorage
      const now = new Date();
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      let totalDays = 0;
      let totalPct = 0;
      let totalPages = 0;
      const keys = Object.keys(localStorage).filter(k => k.startsWith("ibadah_" + monthPrefix));
      const TOTAL_IBADAH = 12;
      for (const k of keys) {
        try {
          const d = JSON.parse(localStorage.getItem(k) || "{}");
          const done = Object.values(d).filter(Boolean).length;
          totalPct += Math.round((done / TOTAL_IBADAH) * 100);
          totalDays++;
        } catch {}
      }
      const sedekahLogs: Array<{ nominal: number; tanggal: string }> = guestStorage.get("sedekah_logs", []);
      const totalSedekah = sedekahLogs
        .filter(l => l.tanggal?.startsWith(monthPrefix))
        .reduce((s, l) => s + l.nominal, 0);
      // Quran pages this month
      const qKeys = Object.keys(localStorage).filter(k => k.startsWith("quran_today_" + monthPrefix));
      for (const k of qKeys) {
        totalPages += Number(localStorage.getItem(k) || 0);
      }
      setMonthStats({ totalIbadahDays: totalDays, avgIbadahPct: totalDays ? Math.round(totalPct / totalDays) : 0, totalQuranPages: totalPages, totalSedekah });
      setLoadingStats(false);
      return;
    }

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    Promise.all([
      supabase.from("daily_ibadah").select("*").eq("user_id", user.id).gte("tanggal", monthStart),
      supabase.from("quran_progress").select("halaman_dibaca").eq("user_id", user.id).gte("tanggal", monthStart),
      supabase.from("sedekah_log").select("nominal").eq("user_id", user.id).gte("tanggal", monthStart),
    ]).then(([ibadah, quran, sedekah]) => {
      const TOTAL_IBADAH = 12;
      const ibadahRows = ibadah.data || [];
      const totalIbadahDays = ibadahRows.length;
      const avgPct = totalIbadahDays
        ? Math.round(
            ibadahRows.reduce((s, row) => {
              const done = [row.subuh, row.dzuhur, row.ashar, row.maghrib, row.isya, row.tahajud, row.dhuha, row.rawatib, row.witir, row.tadarus, row.sahur, row.buka_tepat_waktu].filter(Boolean).length;
              return s + (done / TOTAL_IBADAH) * 100;
            }, 0) / totalIbadahDays
          )
        : 0;
      const totalQuranPages = (quran.data || []).reduce((s, r) => s + (r.halaman_dibaca || 0), 0);
      const totalSedekah = (sedekah.data || []).reduce((s, r) => s + Number(r.nominal || 0), 0);
      setMonthStats({ totalIbadahDays, avgIbadahPct: avgPct, totalQuranPages, totalSedekah });
      setLoadingStats(false);
    });
  }, [user]);

  async function saveName() {
    setSaving(true);
    if (user) {
      await supabase.from("profiles").update({ display_name: nameVal }).eq("id", user.id);
      await refreshProfile();
    } else if (guestProfile) {
      const gp = guestStorage.get<Record<string, unknown>>("profile", {});
      guestStorage.set("profile", { ...gp, display_name: nameVal });
    }
    setSaving(false);
    setEditName(false);
  }

  async function saveQuran() {
    setSaving(true);
    if (user) {
      await supabase.from("profiles").update({ quran_target: quranVal }).eq("id", user.id);
      await refreshProfile();
    } else if (guestProfile) {
      const gp = guestStorage.get<Record<string, unknown>>("profile", {});
      guestStorage.set("profile", { ...gp, quran_target: quranVal });
    }
    setSaving(false);
    setEditQuran(false);
  }

  async function saveSedekah() {
    setSaving(true);
    if (user) {
      await supabase.from("profiles").update({ sedekah_target: sedekahVal }).eq("id", user.id);
      await refreshProfile();
    } else if (guestProfile) {
      const gp = guestStorage.get<Record<string, unknown>>("profile", {});
      guestStorage.set("profile", { ...gp, sedekah_target: sedekahVal });
    }
    setSaving(false);
    setEditSedekah(false);
  }

  async function handleLogout() {
    if (user) {
      await signOut();
    } else {
      guestStorage.clear();
      onGuestLogout?.();
    }
  }

  const now = new Date();
  const monthName = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="px-4 pb-6 space-y-4">
      {/* Avatar & Name */}
      <div className="flex flex-col items-center pt-4 pb-2">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-3 shadow-lg"
          style={{ background: "var(--gradient-gold)" }}
        >
          <User className="w-10 h-10 text-white" />
        </div>

        {editName ? (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <input
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              className="flex-1 text-center text-lg font-bold border border-border rounded-xl px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              maxLength={30}
            />
            <button
              onClick={saveName}
              disabled={saving}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-primary-foreground" />
            </button>
            <button
              onClick={() => { setEditName(false); setNameVal(displayName); }}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditName(true)}
            className="flex items-center gap-2 group"
          >
            <span className="text-xl font-black text-foreground">{displayName}</span>
            <Edit3 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        )}

        <div className="mt-1">
          {isPremium ? (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
              style={{ background: "var(--gradient-gold)", color: "white" }}
            >
              <Crown className="w-3 h-3" /> Premium
            </span>
          ) : (
            <button
              onClick={onUpgrade}
              className="text-xs font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
            >
              ✨ Upgrade Premium
            </button>
          )}
        </div>

        {!user && (
          <p className="text-xs text-muted-foreground mt-2">Mode Tamu — data tersimpan di perangkat ini</p>
        )}
      </div>

      {/* Targets */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-bold text-sm text-foreground">Target Ramadhan</h3>

        {/* Quran target */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target Quran</p>
              {editQuran ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="number"
                    value={quranVal}
                    onChange={e => setQuranVal(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-sm font-bold border border-border rounded-lg px-2 py-0.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    min={1}
                    max={604}
                  />
                  <span className="text-xs text-muted-foreground">hal/hari</span>
                  <button onClick={saveQuran} disabled={saving} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </button>
                  <button onClick={() => { setEditQuran(false); setQuranVal(quranTarget); }} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-bold text-foreground">{quranTarget} hal/hari</p>
              )}
            </div>
          </div>
          {!editQuran && (
            <button onClick={() => setEditQuran(true)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="border-t border-border/60" />

        {/* Sedekah target */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target Sedekah</p>
              {editSedekah ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="number"
                    value={sedekahVal}
                    onChange={e => setSedekahVal(Math.max(1000, Number(e.target.value)))}
                    className="w-24 text-sm font-bold border border-border rounded-lg px-2 py-0.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    step={10000}
                    min={1000}
                  />
                  <button onClick={saveSedekah} disabled={saving} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </button>
                  <button onClick={() => { setEditSedekah(false); setSedekahVal(sedekahTarget); }} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-bold text-foreground">{formatRupiah(sedekahTarget)}</p>
              )}
            </div>
          </div>
          {!editSedekah && (
            <button onClick={() => setEditSedekah(true)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Monthly Recap */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Rekap {monthName}</h3>
        </div>

        {loadingStats ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl bg-muted/60 h-16 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<CheckSquare className="w-4 h-4 text-primary" />}
              label="Hari Ibadah"
              value={`${monthStats?.totalIbadahDays ?? 0} hari`}
              sub={`rata-rata ${monthStats?.avgIbadahPct ?? 0}%`}
              color="bg-primary/10"
            />
            <StatCard
              icon={<BookOpen className="w-4 h-4 text-emerald-600" />}
              label="Halaman Quran"
              value={`${monthStats?.totalQuranPages ?? 0} hal`}
              sub={`${Math.round((monthStats?.totalQuranPages ?? 0) / 20)} juz`}
              color="bg-emerald-500/10"
            />
            <StatCard
              icon={<Heart className="w-4 h-4 text-rose-500" />}
              label="Total Sedekah"
              value={formatRupiah(monthStats?.totalSedekah ?? 0)}
              sub="bulan ini"
              color="bg-rose-500/10"
            />
            <StatCard
              icon={<span className="text-sm">🌙</span>}
              label="Konsistensi"
              value={`${monthStats?.avgIbadahPct ?? 0}%`}
              sub="rata-rata ibadah"
              color="bg-amber-400/10"
            />
          </div>
        )}
      </div>

      {/* Account Info */}
      {user && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <h3 className="font-bold text-sm text-foreground mb-1">Akun</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground truncate max-w-[55%] text-right">{user.email}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-bold ${isPremium ? "text-amber-500" : "text-muted-foreground"}`}>
              {isPremium ? "✨ Premium" : "Gratis"}
            </span>
          </div>
          {isPremium && profile?.premium_activated_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Aktif sejak</span>
              <span className="font-medium text-foreground">
                {new Date(profile.premium_activated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-destructive/40 text-destructive font-bold text-sm hover:bg-destructive/10 transition-all active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        {user ? "Keluar dari akun" : "Keluar dari mode tamu"}
      </button>

      <p className="text-center text-xs text-muted-foreground pb-2">
        Ramadhan Tracker v1.0 · Made with ❤️
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-black text-foreground leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
