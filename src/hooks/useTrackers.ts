import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { guestStorage, getTodayKey, defaultIbadah, defaultHealth, type GuestIbadah, type GuestHealth } from "@/lib/guestStorage";

// ─── Ibadah Hook ─────────────────────────────────────────────────────────────
export function useIbadah(dateKey?: string) {
  const { user } = useAuth();
  const today = dateKey || getTodayKey();
  const [data, setData] = useState<GuestIbadah>(defaultIbadah);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from("daily_ibadah")
        .select("*")
        .eq("user_id", user.id)
        .eq("tanggal", today)
        .single()
        .then(({ data: d }) => {
          if (d) {
            const { subuh, dzuhur, ashar, maghrib, isya, tahajud, dhuha, rawatib, witir, tadarus, sahur, buka_tepat_waktu } = d;
            setData({ subuh, dzuhur, ashar, maghrib, isya, tahajud, dhuha, rawatib, witir, tadarus, sahur, buka_tepat_waktu });
          }
          setLoading(false);
        });
    } else {
      setData(guestStorage.get(`ibadah_${today}`, defaultIbadah));
      setLoading(false);
    }
  }, [user, today]);

  async function toggle(key: keyof GuestIbadah) {
    const updated = { ...data, [key]: !data[key] };
    setData(updated);
    if (user) {
      await supabase
        .from("daily_ibadah")
        .upsert({ user_id: user.id, tanggal: today, ...updated }, { onConflict: "user_id,tanggal" });
    } else {
      guestStorage.set(`ibadah_${today}`, updated);
    }
  }

  const total = Object.keys(defaultIbadah).length;
  const done = Object.values(data).filter(Boolean).length;
  const percent = Math.round((done / total) * 100);

  return { data, toggle, loading, total, done, percent };
}

// ─── Health Hook ─────────────────────────────────────────────────────────────
export function useHealth(dateKey?: string) {
  const { user } = useAuth();
  const today = dateKey || getTodayKey();
  const [data, setData] = useState<GuestHealth>(defaultHealth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from("health_tracker")
        .select("*")
        .eq("user_id", user.id)
        .eq("tanggal", today)
        .single()
        .then(({ data: d }) => {
          if (d) setData({ gelas_air: d.gelas_air, makan_buah: d.makan_buah, olahraga: d.olahraga, jam_tidur: Number(d.jam_tidur) });
          setLoading(false);
        });
    } else {
      setData(guestStorage.get(`health_${today}`, defaultHealth));
      setLoading(false);
    }
  }, [user, today]);

  async function update(patch: Partial<GuestHealth>) {
    const updated = { ...data, ...patch };
    setData(updated);
    if (user) {
      await supabase
        .from("health_tracker")
        .upsert({ user_id: user.id, tanggal: today, ...updated }, { onConflict: "user_id,tanggal" });
    } else {
      guestStorage.set(`health_${today}`, updated);
    }
  }

  return { data, update, loading };
}

// ─── Quran Progress Hook ──────────────────────────────────────────────────────
export function useQuranProgress() {
  const { user } = useAuth();
  const today = getTodayKey();
  const [todayPages, setTodayPages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from("quran_progress")
        .select("halaman_dibaca")
        .eq("user_id", user.id)
        .then(({ data }) => {
          const total = (data || []).reduce((s, r) => s + r.halaman_dibaca, 0);
          setTotalPages(total);
          const todayRec = (data || []).find(() => true); // simplified
          setLoading(false);
        });
      supabase
        .from("quran_progress")
        .select("halaman_dibaca")
        .eq("user_id", user.id)
        .eq("tanggal", today)
        .single()
        .then(({ data }) => {
          if (data) setTodayPages(data.halaman_dibaca);
        });
    } else {
      const t = guestStorage.get<number>(`quran_today_${today}`, 0);
      const total = guestStorage.get<number>("quran_total", 0);
      setTodayPages(t);
      setTotalPages(total);
      setLoading(false);
    }
  }, [user, today]);

  async function addPages(pages: number) {
    const newToday = todayPages + pages;
    const newTotal = totalPages + pages;
    setTodayPages(newToday);
    setTotalPages(newTotal);
    if (user) {
      await supabase
        .from("quran_progress")
        .upsert({ user_id: user.id, tanggal: today, halaman_dibaca: newToday }, { onConflict: "user_id,tanggal" });
    } else {
      guestStorage.set(`quran_today_${today}`, newToday);
      guestStorage.set("quran_total", newTotal);
    }
  }

  return { todayPages, totalPages, addPages, loading };
}

// ─── Sedekah Hook ─────────────────────────────────────────────────────────────
export function useSedekah() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Array<{ id: string; nominal: number; catatan: string | null; tanggal: string }>>([]);
  const [loading, setLoading] = useState(true);

  const total = logs.reduce((s, l) => s + l.nominal, 0);

  useEffect(() => {
    if (user) {
      supabase
        .from("sedekah_log")
        .select("*")
        .eq("user_id", user.id)
        .order("tanggal", { ascending: false })
        .then(({ data }) => {
          if (data) setLogs(data.map(d => ({ id: d.id, nominal: Number(d.nominal), catatan: d.catatan, tanggal: d.tanggal })));
          setLoading(false);
        });
    } else {
      setLogs(guestStorage.get("sedekah_logs", []));
      setLoading(false);
    }
  }, [user]);

  async function addSedekah(nominal: number, catatan: string) {
    const today = getTodayKey();
    if (user) {
      const { data } = await supabase
        .from("sedekah_log")
        .insert({ user_id: user.id, nominal, catatan, tanggal: today })
        .select()
        .single();
      if (data) setLogs(prev => [{ id: data.id, nominal: Number(data.nominal), catatan: data.catatan, tanggal: data.tanggal }, ...prev]);
    } else {
      const newLog = { id: crypto.randomUUID(), nominal, catatan, tanggal: today };
      const updated = [newLog, ...logs];
      setLogs(updated);
      guestStorage.set("sedekah_logs", updated);
    }
  }

  async function deleteSedekah(id: string) {
    if (user) {
      await supabase.from("sedekah_log").delete().eq("id", id);
    }
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    if (!user) guestStorage.set("sedekah_logs", updated);
  }

  return { logs, total, addSedekah, deleteSedekah, loading };
}
