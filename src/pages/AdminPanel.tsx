import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Crown, Key, BarChart3, Settings, ArrowLeft, Loader2 } from "lucide-react";

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  availableCodes: number;
  usedCodes: number;
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/40">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, premiumUsers: 0, availableCodes: 0, usedCodes: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeSection, setActiveSection] = useState<"dashboard" | "config" | "codes" | "users">("dashboard");

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    async function fetchStats() {
      const [
        { count: totalUsers },
        { count: premiumUsers },
        { count: availableCodes },
        { count: usedCodes },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("premium_status", "premium"),
        supabase.from("activation_codes").select("*", { count: "exact", head: true }).eq("status", "available"),
        supabase.from("activation_codes").select("*", { count: "exact", head: true }).eq("status", "used"),
      ]);
      setStats({
        totalUsers: totalUsers ?? 0,
        premiumUsers: premiumUsers ?? 0,
        availableCodes: availableCodes ?? 0,
        usedCodes: usedCodes ?? 0,
      });
      setLoadingStats(false);
    }
    fetchStats();
  }, [isAdmin]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!isAdmin) return null;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "config", label: "App Config", icon: Settings },
    { id: "codes", label: "Kode Aktivasi", icon: Key },
    { id: "users", label: "Users", icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-navy text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-black text-lg">Admin Panel</h1>
          <p className="text-white/50 text-xs">Ramadhan Tracker Control Center</p>
        </div>
        <div className="px-3 py-1 bg-gold/20 border border-gold/40 rounded-full">
          <span className="text-gold text-xs font-bold">Admin</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex overflow-x-auto gap-1 px-4 py-3 bg-white border-b border-border/40 scrollbar-hide">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {activeSection === "dashboard" && <AdminStats stats={stats} loadingStats={loadingStats} />}
        {activeSection === "config" && <AdminConfig />}
        {activeSection === "codes" && <AdminCodes />}
        {activeSection === "users" && <AdminUsers />}
      </div>
    </div>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────
function AdminStats({ stats, loadingStats }: { stats: Stats; loadingStats: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label="Total Pengguna" value={loadingStats ? "..." : stats.totalUsers} color="bg-navy" />
        <StatCard icon={Crown} label="User Premium" value={loadingStats ? "..." : stats.premiumUsers} color="bg-gold" />
        <StatCard icon={Key} label="Kode Tersedia" value={loadingStats ? "..." : stats.availableCodes} color="bg-primary" />
        <StatCard icon={BarChart3} label="Kode Terpakai" value={loadingStats ? "..." : stats.usedCodes} color="bg-muted-foreground" />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-border/40 shadow-sm">
        <p className="font-bold mb-3">Ringkasan</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Konversi Premium</span>
            <span className="font-bold text-primary">
              {stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${stats.totalUsers > 0 ? (stats.premiumUsers / stats.totalUsers) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Penggunaan Kode</span>
            <span className="font-bold text-gold">
              {(stats.availableCodes + stats.usedCodes) > 0
                ? Math.round((stats.usedCodes / (stats.availableCodes + stats.usedCodes)) * 100)
                : 0}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full"
              style={{ width: `${(stats.availableCodes + stats.usedCodes) > 0 ? (stats.usedCodes / (stats.availableCodes + stats.usedCodes)) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Config Section ───────────────────────────────────────────────────────────
function AdminConfig() {
  const [configs, setConfigs] = useState<{ key: string; value: string; description: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("app_config").select("*").order("key").then(({ data }) => {
      if (data) {
        setConfigs(data);
        const vals: Record<string, string> = {};
        data.forEach(c => { vals[c.key] = c.value; });
        setEditValues(vals);
      }
      setLoading(false);
    });
  }, []);

  async function save(key: string) {
    setSaving(key);
    await supabase.from("app_config").update({ value: editValues[key], updated_at: new Date().toISOString() }).eq("key", key);
    setSaving(null);
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      <div className="bg-gold-light/50 rounded-2xl p-3 border border-gold/20">
        <p className="text-xs font-semibold text-gold-dark">💡 Perubahan langsung aktif tanpa deploy ulang</p>
      </div>
      {configs.map(cfg => (
        <div key={cfg.key} className="bg-white rounded-2xl p-4 border border-border/40 shadow-sm">
          <p className="font-bold text-sm">{cfg.key}</p>
          {cfg.description && <p className="text-xs text-muted-foreground mb-2">{cfg.description}</p>}
          <div className="flex gap-2 mt-2">
            <input
              value={editValues[cfg.key] || ""}
              onChange={e => setEditValues(prev => ({ ...prev, [cfg.key]: e.target.value }))}
              className="flex-1 h-10 rounded-xl border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => save(cfg.key)}
              disabled={saving === cfg.key}
              className="px-4 h-10 rounded-xl text-white font-bold text-sm flex items-center gap-1"
              style={{ background: "var(--gradient-sage)" }}
            >
              {saving === cfg.key ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Codes Section ────────────────────────────────────────────────────────────
function AdminCodes() {
  const [codes, setCodes] = useState<{ id: string; code: string; status: string; used_at: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [bulkCount, setBulkCount] = useState(5);
  const [filter, setFilter] = useState<"all" | "available" | "used">("all");

  function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const part = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${part(4)}-${part(4)}`;
  }

  async function fetchCodes() {
    const { data } = await supabase
      .from("activation_codes")
      .select("id, code, status, used_at")
      .order("created_at", { ascending: false });
    if (data) setCodes(data as typeof codes);
    setLoading(false);
  }

  useEffect(() => { fetchCodes(); }, []);

  async function bulkGenerate() {
    setGenerating(true);
    const newCodes = Array.from({ length: bulkCount }, () => ({ code: generateCode(), status: "available" as const }));
    await supabase.from("activation_codes").insert(newCodes);
    await fetchCodes();
    setGenerating(false);
  }

  async function deleteCode(id: string) {
    await supabase.from("activation_codes").delete().eq("id", id);
    setCodes(prev => prev.filter(c => c.id !== id));
  }

  function exportCSV() {
    const rows = [["Kode", "Status", "Tanggal Dipakai"]];
    codes.forEach(c => rows.push([c.code, c.status, c.used_at || "-"]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "activation-codes.csv"; a.click();
  }

  const filtered = filter === "all" ? codes : codes.filter(c => c.status === filter);

  return (
    <div className="space-y-4">
      {/* Generate */}
      <div className="bg-white rounded-2xl p-4 border border-border/40 shadow-sm">
        <p className="font-bold mb-3">Generate Kode Baru</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Jumlah kode</label>
            <input
              type="number"
              min={1}
              max={100}
              value={bulkCount}
              onChange={e => setBulkCount(Number(e.target.value))}
              className="w-full h-10 rounded-xl border border-border px-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              onClick={bulkGenerate}
              disabled={generating}
              className="h-10 px-5 rounded-xl text-white font-bold flex items-center gap-2"
              style={{ background: "var(--gradient-sage)" }}
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Filter + Export */}
      <div className="flex gap-2 justify-between">
        <div className="flex gap-1">
          {(["all", "available", "used"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filter === f ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
            >
              {f === "all" ? "Semua" : f === "available" ? "Tersedia" : "Terpakai"}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-navy text-white">
          Export CSV
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl p-3 border border-border/40 flex items-center gap-3">
              <code className="flex-1 font-mono font-bold text-sm tracking-widest">{c.code}</code>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                c.status === "available" ? "bg-sage-light text-sage-dark" : "bg-muted text-muted-foreground"
              }`}>
                {c.status === "available" ? "✓ Tersedia" : "✗ Terpakai"}
              </span>
              {c.status === "available" && (
                <button onClick={() => deleteCode(c.id)} className="text-destructive text-xs hover:underline">Hapus</button>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">Belum ada kode</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Users Section ────────────────────────────────────────────────────────────
function AdminUsers() {
  const [users, setUsers] = useState<{ id: string; display_name: string | null; premium_status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  async function fetchUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, premium_status, created_at")
      .order("created_at", { ascending: false });
    if (data) setUsers(data as typeof users);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function togglePremium(userId: string, current: string) {
    setToggling(userId);
    const newStatus = current === "premium" ? "free" : "premium";
    await supabase.from("profiles").update({
      premium_status: newStatus,
      premium_activated_at: newStatus === "premium" ? new Date().toISOString() : null,
    }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, premium_status: newStatus } : u));
    setToggling(null);
  }

  const filtered = users.filter(u =>
    (u.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <input
        placeholder="Cari nama pengguna..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full h-11 rounded-xl border border-border px-4 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
      />
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="bg-white rounded-xl p-3 border border-border/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                {(u.display_name || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{u.display_name || "Tanpa Nama"}</p>
                <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <button
                onClick={() => togglePremium(u.id, u.premium_status)}
                disabled={toggling === u.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  u.premium_status === "premium" ? "bg-gold/20 text-gold-dark" : "bg-muted text-muted-foreground"
                }`}
              >
                {toggling === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crown className="w-3 h-3" />}
                {u.premium_status === "premium" ? "Premium" : "Free"}
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">Tidak ada pengguna</div>
          )}
        </div>
      )}
    </div>
  );
}
