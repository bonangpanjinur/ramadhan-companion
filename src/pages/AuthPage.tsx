import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Star, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuthPageProps {
  onGuestMode: () => void;
}

export default function AuthPage({ onGuestMode }: AuthPageProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return toast.error("Isi email dan password");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message === "Invalid login credentials" ? "Email atau password salah" : error.message);
    setLoading(false);
  }

  async function handleRegister() {
    if (!email || !password || !name) return toast.error("Semua field wajib diisi");
    if (password.length < 6) return toast.error("Password minimal 6 karakter");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name }, emailRedirectTo: window.location.origin },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Cek email kamu untuk verifikasi! 📧");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--gradient-hero)" }}>
      {/* Islamic pattern overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col items-center justify-center pt-16 pb-8 px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center">
            <Moon className="w-7 h-7 text-gold" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">Ramadhan Tracker</h1>
        <p className="text-white/60 text-sm text-center">Maksimalkan ibadah Ramadhan-mu 🌙</p>

        {/* Stars decoration */}
        <div className="absolute top-8 right-8 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <Star key={i} className="w-3 h-3 text-gold/60 fill-gold/60" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      </div>

      {/* Auth Card */}
      <div className="relative flex-1 bg-background rounded-t-[32px] px-6 pt-8 pb-6 animate-slide-up">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
          <TabsList className="w-full mb-6 bg-muted rounded-xl h-12">
            <TabsTrigger value="login" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
              Masuk
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
              Daftar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold text-foreground/80">Email</Label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 rounded-xl border-border/60 bg-muted/50"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-foreground/80">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-border/60 bg-muted/50 pr-12"
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-base"
              style={{ background: "var(--gradient-sage)" }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk"}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold text-foreground/80">Nama Panggilan</Label>
              <Input
                placeholder="Nama kamu"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-12 rounded-xl border-border/60 bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-foreground/80">Email</Label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 rounded-xl border-border/60 bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-foreground/80">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-border/60 bg-muted/50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-base"
              style={{ background: "var(--gradient-sage)" }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Daftar Sekarang"}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Guest Mode */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm mb-2">Belum mau daftar?</p>
          <button
            onClick={onGuestMode}
            className="text-primary font-semibold text-sm underline underline-offset-2"
          >
            Lanjut sebagai Tamu (tanpa akun)
          </button>
        </div>

        {/* Quote */}
        <div className="mt-8 bg-sage-light/60 rounded-2xl p-4 text-center">
          <p className="text-sage-dark text-sm font-medium italic">
            "Barangsiapa berpuasa di bulan Ramadhan karena iman dan mengharap pahala, maka dosanya yang telah lalu akan diampuni."
          </p>
          <p className="text-sage-dark/60 text-xs mt-1">— HR. Bukhari & Muslim</p>
        </div>
      </div>
    </div>
  );
}
