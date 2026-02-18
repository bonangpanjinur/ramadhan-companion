import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

interface Doa {
  id: string;
  judul: string;
  arab: string;
  latin: string;
  terjemahan: string;
  kategori: string;
}

export default function DoaPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [doas, setDoas] = useState<Doa[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState<string>("semua");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const KATEGORI = ["semua", "puasa", "malam", "sholat", "quran", "harian", "dzikir"];

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("doa_collection")
        .select("*")
        .order("urutan");
      if (data) setDoas(data as Doa[]);
      setLoading(false);
    }
    fetch();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("doa_bookmarks")
      .select("doa_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setBookmarks(new Set(data.map(d => d.doa_id)));
      });
  }, [user]);

  async function toggleBookmark(doaId: string) {
    if (!user) return;
    if (bookmarks.has(doaId)) {
      await supabase.from("doa_bookmarks").delete().eq("user_id", user.id).eq("doa_id", doaId);
      setBookmarks(prev => { const next = new Set(prev); next.delete(doaId); return next; });
    } else {
      await supabase.from("doa_bookmarks").insert({ user_id: user.id, doa_id: doaId });
      setBookmarks(prev => new Set([...prev, doaId]));
    }
  }

  const filtered = doas.filter(d => {
    const matchSearch = d.judul.toLowerCase().includes(search.toLowerCase()) ||
      d.terjemahan.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategori === "semua" ? true :
      kategori === "bookmark" ? bookmarks.has(d.id) :
      d.kategori === kategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="min-h-full flex flex-col bg-background pb-8">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6 text-white relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <button onClick={onBack} className="text-white/70 text-sm mb-3 flex items-center gap-1">← Kembali</button>
        <h1 className="font-black text-2xl">📖 Koleksi Doa</h1>
        <p className="text-white/60 text-sm mt-1">Doa-doa pilihan bulan Ramadhan</p>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari doa..."
            className="w-full h-10 rounded-xl bg-white/15 text-white placeholder-white/40 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>
      </div>

      {/* Kategori Filter */}
      <div className="flex gap-1.5 overflow-x-auto px-4 py-3 scrollbar-hide bg-background border-b border-border/30">
        {KATEGORI.map(k => (
          <button
            key={k}
            onClick={() => setKategori(k)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              kategori === k ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {k === "semua" ? "Semua" : k === "bookmark" ? "⭐ Simpan" : k}
          </button>
        ))}
        <button
          onClick={() => setKategori("bookmark")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            kategori === "bookmark" ? "bg-gold text-navy" : "bg-muted text-muted-foreground"
          }`}
        >
          ⭐ Simpan
        </button>
      </div>

      {/* Doa List */}
      <div className="flex-1 p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">🤲</p>
            <p className="text-muted-foreground text-sm">Tidak ada doa ditemukan</p>
          </div>
        ) : (
          filtered.map(doa => {
            const isOpen = expanded === doa.id;
            const isBookmarked = bookmarks.has(doa.id);
            return (
              <div
                key={doa.id}
                className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : doa.id)}
                  className="w-full flex items-center gap-3 p-4 text-left tap-target"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground">{doa.judul}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doa.kategori}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user && (
                      <button
                        onClick={e => { e.stopPropagation(); toggleBookmark(doa.id); }}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        {isBookmarked
                          ? <BookmarkCheck className="w-5 h-5 text-gold" />
                          : <Bookmark className="w-5 h-5 text-muted-foreground" />
                        }
                      </button>
                    )}
                    <span className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-border/30 pt-3">
                    {/* Arabic */}
                    <p
                      className="text-right text-xl leading-loose font-medium"
                      style={{ fontFamily: "serif", direction: "rtl", color: "hsl(var(--navy))" }}
                    >
                      {doa.arab}
                    </p>

                    {/* Latin */}
                    <p className="text-sm italic text-primary font-medium">{doa.latin}</p>

                    {/* Terjemahan */}
                    <div className="bg-sage-light/50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-sage-dark mb-1">Artinya:</p>
                      <p className="text-sm text-foreground leading-relaxed">{doa.terjemahan}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
