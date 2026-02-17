import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import LiveBar from "./LiveBar";
import { liveMode, matches } from "@/lib/mock-data";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Standings", path: "/standings" },
  { label: "Teams", path: "/teams" },
  { label: "Matches", path: "/matches" },
  { label: "Players", path: "/players" },
  { label: "Statistics", path: "/statistics" },
  { label: "News", path: "/news" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const liveMatch = liveMode.isLive && liveMode.matchId
    ? matches.find((m) => m.id === liveMode.matchId)
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <LiveBar
        isLive={liveMode.isLive}
        teamA={liveMatch?.teamA}
        teamB={liveMatch?.teamB}
        streamUrl={liveMode.streamUrl}
        score={liveMode.currentScore}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <Shield className="h-8 w-8 text-primary" />
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
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold text-foreground">IPHF</span>
              <span className="text-xs text-muted-foreground">© 2025 International Puck Hockey Federation</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/standings" className="hover:text-foreground transition-colors">Standings</Link>
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
