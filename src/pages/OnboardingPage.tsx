import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Moon, Book, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { guestStorage } from "@/lib/guestStorage";

interface OnboardingProps {
  isGuest?: boolean;
  userId?: string;
  onComplete: (data: { display_name: string; ramadhan_day: number; quran_target: number; sedekah_target: number }) => void;
}

export default function OnboardingPage({ isGuest, userId, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [ramadhanDay, setRamadhanDay] = useState(1);
  const [quranTarget, setQuranTarget] = useState(1);
  const [sedekahTarget, setSedekahTarget] = useState(100000);
  const [loading, setLoading] = useState(false);

  const pagesPerDay = Math.ceil((604 * quranTarget) / (30 - ramadhanDay + 1));

  async function handleFinish() {
    if (!name.trim()) return toast.error("Masukkan nama kamu dulu");
    setLoading(true);
    const data = { display_name: name, ramadhan_day: ramadhanDay, quran_target: quranTarget, sedekah_target: sedekahTarget };

    if (isGuest) {
      guestStorage.set("profile", { ...data, onboarding_done: true });
    } else if (userId) {
      await supabase.from("profiles").update(data).eq("id", userId);
      await supabase.from("ramadhan_settings").upsert({ user_id: userId, onboarding_done: true }, { onConflict: "user_id" });
    }
    setLoading(false);
    onComplete(data);
  }

  const steps = [
    // Step 0: Name + Ramadhan Day
    <div key={0} className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="w-20 h-20 bg-navy rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
          <Moon className="w-10 h-10 text-gold" />
          <div className="absolute inset-0 bg-gold/10 rounded-full animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Halo! Nama kamu?</h2>
        <p className="text-muted-foreground mt-1 text-sm">Kami akan menyapa kamu setiap hari</p>
      </div>

      <div>
        <Input
          placeholder="Nama panggilan..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="h-12 rounded-xl text-center text-lg font-semibold border-border/60"
          autoFocus
        />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-foreground">Hari ke berapa Ramadhan?</span>
          <span className="font-bold text-primary text-lg">Hari {ramadhanDay}</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          value={ramadhanDay}
          onChange={e => setRamadhanDay(Number(e.target.value))}
          className="w-full accent-primary h-2 rounded-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Hari 1</span>
          <span>Hari 30</span>
        </div>
      </div>

      <Button
        onClick={() => setStep(1)}
        disabled={!name.trim()}
        className="w-full h-12 rounded-xl font-bold"
        style={{ background: "var(--gradient-sage)" }}
      >
        Lanjut <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>,

    // Step 1: Quran Target
    <div key={1} className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Book className="w-10 h-10 text-gold" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Target Khatam Al-Quran</h2>
        <p className="text-muted-foreground mt-1 text-sm">Berapa kali kamu ingin khatam bulan ini?</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(t => (
          <button
            key={t}
            onClick={() => setQuranTarget(t)}
            className={`p-4 rounded-2xl border-2 font-bold text-center transition-all ${
              quranTarget === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/50 text-foreground"
            }`}
          >
            <div className="text-3xl font-black">{t}x</div>
            <div className="text-xs mt-1 font-normal text-muted-foreground">khatam</div>
          </button>
        ))}
      </div>

      <div className="bg-sage-light/50 rounded-2xl p-4 text-center">
        <p className="text-sage-dark font-semibold">Kamu perlu membaca</p>
        <p className="text-3xl font-black text-primary mt-1">{pagesPerDay} halaman</p>
        <p className="text-sage-dark/70 text-sm">per hari untuk {quranTarget}x khatam</p>
        <p className="text-xs text-muted-foreground mt-1">({604 * quranTarget} halaman total, sisa {30 - ramadhanDay + 1} hari)</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-12 rounded-xl">
          Kembali
        </Button>
        <Button
          onClick={() => setStep(2)}
          className="flex-1 h-12 rounded-xl font-bold"
          style={{ background: "var(--gradient-sage)" }}
        >
          Lanjut <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>,

    // Step 2: Sedekah Target
    <div key={2} className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Target Sedekah</h2>
        <p className="text-muted-foreground mt-1 text-sm">Berapa yang ingin kamu sedekahkan bulan ini?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[50000, 100000, 250000, 500000].map(v => (
          <button
            key={v}
            onClick={() => setSedekahTarget(v)}
            className={`p-3 rounded-2xl border-2 font-semibold text-sm transition-all ${
              sedekahTarget === v
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/50 text-foreground"
            }`}
          >
            Rp {(v / 1000).toFixed(0)}.000
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-semibold text-muted-foreground block mb-2">Atau masukkan sendiri:</label>
        <Input
          type="number"
          placeholder="Nominal (Rp)"
          value={sedekahTarget}
          onChange={e => setSedekahTarget(Number(e.target.value))}
          className="h-12 rounded-xl text-center font-semibold"
        />
      </div>

      <div className="bg-gold-light/60 rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground italic">
          "Sedekah tidak akan mengurangi harta. Allah pasti akan menambah kemuliaan orang yang memaafkan."
        </p>
        <p className="text-xs font-semibold text-gold-dark mt-1">— HR. Muslim</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">
          Kembali
        </Button>
        <Button
          onClick={handleFinish}
          disabled={loading}
          className="flex-1 h-12 rounded-xl font-bold"
          style={{ background: "var(--gradient-gold)" }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mulai Ramadhan! 🎉"}
        </Button>
      </div>
    </div>,
  ];

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-12 pb-6">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/40" : "w-2 bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 px-6 pb-8">
        {steps[step]}
      </div>
    </div>
  );
}
