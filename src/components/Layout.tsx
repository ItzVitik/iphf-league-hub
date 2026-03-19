import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import iphfLogo from "@/assets/iphf-logo.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LiveBar from "./LiveBar";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Standings", path: "/standings" },
  { label: "Playoffs", path: "/playoffs" },
  { label: "Teams", path: "/teams" },
  { label: "Matches", path: "/matches" },
  { label: "Players", path: "/players" },
  { label: "Statistics", path: "/statistics" },
  { label: "News", path: "/news" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  const { data: live } = useQuery({
    queryKey: ["live-bar"],
    queryFn: async () => {
      const { data } = await supabase
        .from("live_mode")
        .select("*, matches(*, team_a:teams!team_a_id(name), team_b:teams!team_b_id(name))")
        .eq("id", 1)
        .single();
      return data;
    },
    refetchInterval: 15000,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <LiveBar
        isLive={live?.is_live ?? false}
        teamA={live?.matches ? (live.matches as any).team_a?.name : undefined}
        teamB={live?.matches ? (live.matches as any).team_b?.name : undefined}
        streamUrl={live?.stream_url ?? undefined}
        score={live?.is_live ? { home: live.team_a_score ?? 0, away: live.team_b_score ?? 0 } : undefined}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={iphfLogo} alt="IPHF Logo" className="h-10 w-10 rounded-full" />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-heading font-bold tracking-wide text-foreground">IPHF</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Puck Hockey Federation</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={isAdmin ? "/admin" : "/login"}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                location.pathname === "/admin" || location.pathname === "/login"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-border bg-background animate-slide-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-6 py-3 text-sm font-medium border-b border-border transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={isAdmin ? "/admin" : "/login"}
              onClick={() => setMobileOpen(false)}
              className={`block px-6 py-3 text-sm font-medium border-b border-border transition-colors flex items-center gap-2 ${
                location.pathname === "/admin" || location.pathname === "/login"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          </nav>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={iphfLogo} alt="IPHF" className="h-6 w-6 rounded-full" />
              <span className="font-heading font-bold text-foreground">IPHF</span>
              <span className="text-xs text-muted-foreground">© 2026 International Puck Hockey Federation</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/standings" className="hover:text-foreground transition-colors">Standings</Link>
              <Link to="/playoffs" className="hover:text-foreground transition-colors">Playoffs</Link>
              <Link to="/teams" className="hover:text-foreground transition-colors">Teams</Link>
              <Link to="/matches" className="hover:text-foreground transition-colors">Matches</Link>
              <a href="https://discord.gg/iphf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
