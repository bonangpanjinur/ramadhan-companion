import { useState, useEffect } from "react";
import { LayoutDashboard, CheckSquare, BookOpen, Heart, Activity, Crown, Settings, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { guestStorage } from "@/lib/guestStorage";
import AuthPage from "@/pages/AuthPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardTab from "@/pages/tabs/DashboardTab";
import IbadahTab from "@/pages/tabs/IbadahTab";
import QuranTab from "@/pages/tabs/QuranTab";
import SedekahTab from "@/pages/tabs/SedekahTab";
import KesehatanTab from "@/pages/tabs/KesehatanTab";
import ProfileTab from "@/pages/tabs/ProfileTab";
import UpgradePage from "@/pages/UpgradePage";
import PremiumHub from "@/pages/premium/PremiumHub";

const TABS = [
  { id: "dashboard", label: "Beranda", icon: LayoutDashboard },
  { id: "ibadah", label: "Ibadah", icon: CheckSquare },
  { id: "quran", label: "Quran", icon: BookOpen },
  { id: "sedekah", label: "Sedekah", icon: Heart },
  { id: "kesehatan", label: "Sehat", icon: Activity },
  { id: "profil", label: "Profil", icon: UserCircle },
];

export default function Index() {
  const { user, profile, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activePage, setActivePage] = useState<"main" | "upgrade" | "premium">("main");
  const [isGuest, setIsGuest] = useState(false);
  const [guestProfile, setGuestProfile] = useState<{ display_name: string; ramadhan_day: number; quran_target: number; sedekah_target: number } | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);

  // Check guest mode on mount
  useEffect(() => {
    const gp = guestStorage.get<{ display_name?: string; onboarding_done?: boolean; ramadhan_day?: number; quran_target?: number; sedekah_target?: number } | null>("profile", null);
    if (gp?.onboarding_done) {
      setIsGuest(true);
      setGuestProfile({
        display_name: gp.display_name || "Sahabat",
        ramadhan_day: gp.ramadhan_day || 1,
        quran_target: gp.quran_target || 1,
        sedekah_target: gp.sedekah_target || 100000,
      });
    }
  }, []);

  // Check onboarding for logged-in users
  useEffect(() => {
    if (user) {
      const done = guestStorage.get<boolean>(`onboarding_${user.id}`, false);
      setOnboardingDone(done);
    }
  }, [user]);

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

  // Not logged in, not guest → Auth page
  if (!user && !isGuest) {
    return (
      <PhoneFrame>
        <AuthPage onGuestMode={() => {
          const gp = guestStorage.get<{ display_name?: string; onboarding_done?: boolean; ramadhan_day?: number; quran_target?: number; sedekah_target?: number } | null>("profile", null);
          if (gp?.onboarding_done) {
            setIsGuest(true);
            setGuestProfile({
              display_name: gp.display_name || "Sahabat",
              ramadhan_day: gp.ramadhan_day || 1,
              quran_target: gp.quran_target || 1,
              sedekah_target: gp.sedekah_target || 100000,
            });
          } else {
            setIsGuest(true);
          }
        }} />
      </PhoneFrame>
    );
  }

  // Guest onboarding
  if (isGuest && !guestProfile) {
    return (
      <PhoneFrame>
        <OnboardingPage
          isGuest
          onComplete={(data) => {
            setGuestProfile(data);
          }}
        />
      </PhoneFrame>
    );
  }

  // Logged-in user onboarding
  if (user && !onboardingDone && profile && !profile.display_name) {
    return (
      <PhoneFrame>
        <OnboardingPage
          userId={user.id}
          onComplete={() => {
            guestStorage.set(`onboarding_${user.id}`, true);
            setOnboardingDone(true);
          }}
        />
      </PhoneFrame>
    );
  }

  const isPremium = profile?.premium_status === "premium";
  const displayName = profile?.display_name || guestProfile?.display_name || "Sahabat";

  function handleNavigate(target: string) {
    if (target === "upgrade") setActivePage("upgrade");
    else if (target === "premium") setActivePage("premium");
    else { setActivePage("main"); setActiveTab(target); }
  }

  const renderContent = () => {
    if (activePage === "upgrade") {
      return <UpgradePage onBack={() => setActivePage("main")} />;
    }
    if (activePage === "premium") {
      return (
        <PremiumHub
          onBack={() => setActivePage("main")}
          onUpgrade={() => setActivePage("upgrade")}
          displayName={displayName}
        />
      );
    }
    switch (activeTab) {
      case "dashboard": return <DashboardTab onNavigate={handleNavigate} isPremium={isPremium} guestProfile={guestProfile ?? undefined} />;
      case "ibadah": return <IbadahTab />;
      case "quran": return <QuranTab isPremium={isPremium} onUpgrade={() => setActivePage("upgrade")} />;
      case "sedekah": return <SedekahTab isPremium={isPremium} onUpgrade={() => setActivePage("upgrade")} />;
      case "kesehatan": return <KesehatanTab isPremium={isPremium} onUpgrade={() => setActivePage("upgrade")} />;
      case "profil": return (
        <ProfileTab
          onUpgrade={() => setActivePage("upgrade")}
          guestProfile={guestProfile}
          onGuestLogout={() => {
            setIsGuest(false);
            setGuestProfile(null);
            setActiveTab("dashboard");
          }}
        />
      );
      default: return null;
    }
  };

  const showBottomNav = activePage === "main";

  return (
    <PhoneFrame>
      {/* Status bar */}
      <div className="h-10 bg-navy flex items-end px-4 pb-1 justify-between flex-shrink-0">
        <span className="text-white/60 text-xs font-medium">
          {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="text-white/60 text-xs">Ramadhan 1446H 🌙</span>
      </div>

      {/* Page Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h1 className="font-black text-lg text-foreground flex items-center gap-2">
          🌙 Ramadhan Tracker
          {isPremium && <Crown className="w-4 h-4 text-gold" />}
        </h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="p-2 rounded-xl bg-muted tap-target"
              title="Admin Panel"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => setActivePage(activePage === "premium" ? "main" : "premium")}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={isPremium
              ? { background: "var(--gradient-gold)", color: "white" }
              : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
            }
          >
            {isPremium ? "✨ Premium" : "Fitur+"}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="py-4 min-h-full">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Nav */}
      {showBottomNav && (
        <div className="flex-shrink-0 bg-white/95 backdrop-blur border-t border-border/40 flex">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id && activePage === "main";
            return (
              <button
                key={tab.id}
                onClick={() => { setActivePage("main"); setActiveTab(tab.id); }}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 tap-target transition-all"
              >
                <Icon
                  className={`w-5 h-5 transition-all ${active ? "text-primary scale-110" : "text-muted-foreground"}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className={`text-xs font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
                {active && <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
              </button>
            );
          })}
        </div>
      )}
    </PhoneFrame>
  );
}

// ─── Phone Frame Wrapper ──────────────────────────────────────────────────────
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone-frame-bg">
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
