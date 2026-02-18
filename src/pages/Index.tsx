import { useState, useEffect } from "react";
import { LayoutDashboard, CheckSquare, BookOpen, Heart, Activity, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { guestStorage } from "@/lib/guestStorage";
import AuthPage from "@/pages/AuthPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardTab from "@/pages/tabs/DashboardTab";
import IbadahTab from "@/pages/tabs/IbadahTab";
import QuranTab from "@/pages/tabs/QuranTab";
import SedekahTab from "@/pages/tabs/SedekahTab";
import KesehatanTab from "@/pages/tabs/KesehatanTab";
import UpgradePage from "@/pages/UpgradePage";

const TABS = [
  { id: "dashboard", label: "Beranda", icon: LayoutDashboard },
  { id: "ibadah", label: "Ibadah", icon: CheckSquare },
  { id: "quran", label: "Quran", icon: BookOpen },
  { id: "sedekah", label: "Sedekah", icon: Heart },
  { id: "kesehatan", label: "Sehat", icon: Activity },
];

export default function Index() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestProfile, setGuestProfile] = useState<{ display_name: string; ramadhan_day: number; quran_target: number; sedekah_target: number } | null>(null);

  // Check guest mode on mount
  useEffect(() => {
    const gp = guestStorage.get<{ display_name?: string; onboarding_done?: boolean } | null>("profile", null);
    if (gp?.onboarding_done) {
      setIsGuest(true);
      setGuestProfile(gp as typeof guestProfile);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌙</span>
          </div>
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Not logged in, not guest → show auth
  if (!user && !isGuest) {
    return (
      <div className="phone-frame-bg">
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="phone-screen">
            <AuthPage
              onGuestMode={() => {
                const gp = guestStorage.get<{ display_name?: string; onboarding_done?: boolean } | null>("profile", null);
                if (gp?.onboarding_done) {
                  setIsGuest(true);
                  setGuestProfile(gp as typeof guestProfile);
                } else {
                  setIsGuest(true);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Guest onboarding
  if (isGuest && !guestProfile) {
    return (
      <div className="phone-frame-bg">
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="phone-screen">
            <OnboardingPage
              isGuest
              onComplete={(data) => {
                setGuestProfile({ display_name: data.display_name, ramadhan_day: data.ramadhan_day, quran_target: data.quran_target, sedekah_target: data.sedekah_target });
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Logged in but onboarding not done
  if (user && profile && !guestStorage.get<{done?: boolean}>(`onboarding_${user.id}`, {}).done) {
    const needsOnboarding = !profile.display_name || profile.display_name === profile.id?.slice(0, 8);
    if (needsOnboarding) {
      return (
        <div className="phone-frame-bg">
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-screen">
              <OnboardingPage
                userId={user.id}
                onComplete={() => {
                  guestStorage.set(`onboarding_${user.id}`, { done: true });
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  const isPremium = profile?.premium_status === "premium";

  const renderTab = () => {
    if (showUpgrade) return <UpgradePage onBack={() => setShowUpgrade(false)} />;
    switch (activeTab) {
      case "dashboard": return <DashboardTab onNavigate={(t) => t === "upgrade" ? setShowUpgrade(true) : setActiveTab(t)} isPremium={isPremium} guestProfile={guestProfile ?? undefined} />;
      case "ibadah": return <IbadahTab />;
      case "quran": return <QuranTab isPremium={isPremium} onUpgrade={() => setShowUpgrade(true)} />;
      case "sedekah": return <SedekahTab isPremium={isPremium} onUpgrade={() => setShowUpgrade(true)} />;
      case "kesehatan": return <KesehatanTab isPremium={isPremium} onUpgrade={() => setShowUpgrade(true)} />;
      default: return null;
    }
  };

  return (
    <div className="phone-frame-bg">
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen">
          {/* Status bar spacer */}
          <div className="h-10 bg-navy flex items-end px-4 pb-1 justify-between">
            <span className="text-white/60 text-xs font-medium">
              {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-white/60 text-xs">🔋 Ramadhan 1446H</span>
          </div>

          {/* Page Header */}
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="font-black text-lg text-foreground flex items-center gap-2">
                🌙 Ramadhan Tracker
                {isPremium && <Crown className="w-4 h-4 text-gold" />}
              </h1>
            </div>
            <button
              onClick={() => setShowUpgrade(!showUpgrade)}
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={isPremium
                ? { background: "var(--gradient-gold)", color: "white" }
                : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
              }
            >
              {isPremium ? "✨ Premium" : "Upgrade"}
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto" style={{ height: "calc(100% - 120px)", scrollbarWidth: "none" }}>
            <div className="py-4 min-h-full">
              {renderTab()}
            </div>
          </div>

          {/* Bottom Nav */}
          {!showUpgrade && (
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-border/40 flex">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center justify-center py-3 gap-1 tap-target transition-all"
                  >
                    <Icon
                      className={`w-5 h-5 transition-all ${active ? "text-primary scale-110" : "text-muted-foreground"}`}
                      strokeWidth={active ? 2.5 : 1.8}
                    />
                    <span className={`text-xs font-semibold transition-all ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {tab.label}
                    </span>
                    {active && <div className="w-1 h-1 bg-primary rounded-full" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
