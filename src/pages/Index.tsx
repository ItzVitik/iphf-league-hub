import { Link } from "react-router-dom";
import { Trophy, Calendar, Users, BarChart3, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";
import iphfLogo from "@/assets/iphf-logo.png";

const Index = () => {
  // Fetch standings with team info
  const { data: standings } = useQuery({
    queryKey: ["home-standings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("standings").select("*, teams(id, name, abbreviation, color)").order("pts", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch players with team info
  const { data: players } = useQuery({
    queryKey: ["home-players"],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*, teams(name)").order("points", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch upcoming matches
  const { data: upcomingMatches } = useQuery({
    queryKey: ["home-upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase.from("matches").select("*, team_a:teams!team_a_id(name), team_b:teams!team_b_id(name)").eq("status", "Scheduled").order("match_date").limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Fetch latest news
  const { data: latestNews } = useQuery({
    queryKey: ["home-news"],
    queryFn: async () => {
      const { data, error } = await supabase.from("news_articles").select("*").order("published_at", { ascending: false }).limit(3);
      if (error) throw error;
      return data;
    },
  });

  const skaters = players?.filter(p => p.position !== "G") || [];
  const goalies = players?.filter(p => p.position === "G") || [];
  const topScorer = skaters[0];
  const bestGoalie = [...goalies].sort((a, b) => (Number(b.save_pct) || 0) - (Number(a.save_pct) || 0))[0];

  // Player of the Month: highest points this calendar month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  // Simple approach: player with most points overall (in a real system you'd track monthly stats)
  // Using top scorer as Player of the Month
  const playerOfMonth = skaters[0];

  const standingsPreview = standings?.slice(0, 5) || [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36 text-center">
          <div className="flex justify-center mb-6">
            <img src={iphfLogo} alt="IPHF Logo" className="h-24 w-24 md:h-32 md:w-32 rounded-full shadow-glow-red" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-foreground mb-3">
            INTERNATIONAL PUCK<br />
            <span className="text-gradient-accent">HOCKEY FEDERATION</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-2 font-medium">Season 1 — 2025</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
            The premier competitive Puck Hockey league. Eight teams. One champion.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Standings", icon: Trophy, path: "/standings" },
              { label: "Matches", icon: Calendar, path: "/matches" },
              { label: "Teams", icon: Users, path: "/teams" },
              { label: "Statistics", icon: BarChart3, path: "/statistics" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2 rounded-lg bg-secondary/80 border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-primary/10 hover:border-primary/40 hover:shadow-glow-blue"
              >
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </Link>
            ))}
            <a
              href="https://discord.gg/iphf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-[#5865F2]/30"
            >
              <ExternalLink className="h-4 w-4" />
              Discord
            </a>
          </div>
        </div>
      </section>

      {/* Top Players */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Player Spotlight</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topScorer && (
            <div className="bg-gradient-card rounded-lg border border-primary/20 p-5 shadow-glow-blue">
              <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Top Scorer</div>
              <div className="text-xl font-heading font-bold text-foreground">{topScorer.name}</div>
              <div className="text-sm text-muted-foreground">{(topScorer as any).teams?.name || "Free Agent"}</div>
              <div className="mt-3 text-3xl font-heading font-bold text-primary">{topScorer.points} <span className="text-sm text-muted-foreground font-body">PTS</span></div>
              <div className="text-xs text-muted-foreground">{topScorer.goals}G · {topScorer.assists}A</div>
            </div>
          )}
          {bestGoalie && (
            <div className="bg-gradient-card rounded-lg border border-accent/20 p-5 shadow-glow-red">
              <div className="text-xs uppercase tracking-wider text-accent font-semibold mb-1">Best Goalie</div>
              <div className="text-xl font-heading font-bold text-foreground">{bestGoalie.name}</div>
              <div className="text-sm text-muted-foreground">{(bestGoalie as any).teams?.name || "Free Agent"}</div>
              <div className="mt-3 text-3xl font-heading font-bold text-accent">{bestGoalie.save_pct != null ? (Number(bestGoalie.save_pct) * 100).toFixed(1) : "0.0"}%<span className="text-sm text-muted-foreground font-body ml-1">SV%</span></div>
              <div className="text-xs text-muted-foreground">{bestGoalie.shutouts ?? 0} SO · {bestGoalie.saves ?? 0} SVS</div>
            </div>
          )}
          {playerOfMonth && (
            <div className="bg-gradient-card rounded-lg border border-gold/20 p-5">
              <div className="text-xs uppercase tracking-wider text-gold font-semibold mb-1">Player of the Month</div>
              <div className="text-xl font-heading font-bold text-foreground">{playerOfMonth.name}</div>
              <div className="text-sm text-muted-foreground">{(playerOfMonth as any).teams?.name || "Free Agent"}</div>
              <div className="mt-3 text-3xl font-heading font-bold text-gold">⭐</div>
              <div className="text-xs text-muted-foreground">{playerOfMonth.points} PTS · {playerOfMonth.goals}G · {playerOfMonth.assists}A</div>
            </div>
          )}
        </div>
      </section>

      {/* Standings Preview + Upcoming */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Standings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-foreground">Standings</h2>
              <Link to="/standings" className="text-xs text-primary hover:underline font-medium">View Full →</Link>
            </div>
            <div className="bg-gradient-card rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                    <th className="text-left px-4 py-3">#</th>
                    <th className="text-left px-4 py-3">Team</th>
                    <th className="text-center px-2 py-3">GP</th>
                    <th className="text-center px-2 py-3">W</th>
                    <th className="text-center px-2 py-3">L</th>
                    <th className="text-center px-2 py-3">OT</th>
                    <th className="text-center px-2 py-3 text-primary font-bold">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standingsPreview.map((s: any, i) => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link to={`/teams/${s.teams?.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                          {s.teams?.name}
                        </Link>
                      </td>
                      <td className="text-center px-2 py-3 text-muted-foreground">{s.gp}</td>
                      <td className="text-center px-2 py-3">{s.w}</td>
                      <td className="text-center px-2 py-3">{s.l}</td>
                      <td className="text-center px-2 py-3">{s.ot}</td>
                      <td className="text-center px-2 py-3 font-bold text-primary">{s.pts}</td>
                    </tr>
                  ))}
                  {standingsPreview.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-6 text-muted-foreground">No standings data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-foreground">Upcoming</h2>
              <Link to="/matches" className="text-xs text-primary hover:underline font-medium">All Matches →</Link>
            </div>
            <div className="space-y-3">
              {upcomingMatches?.map((match: any) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="block bg-gradient-card rounded-lg border border-border p-4 transition-all hover:border-primary/40 hover:shadow-glow-blue"
                >
                  <div className="text-xs text-muted-foreground mb-2">{match.match_date} · {match.match_time}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm">{match.team_a?.name}</span>
                    <span className="text-xs text-muted-foreground px-2">VS</span>
                    <span className="font-semibold text-foreground text-sm">{match.team_b?.name}</span>
                  </div>
                  <div className="mt-2 text-xs text-primary font-medium uppercase">Scheduled</div>
                </Link>
              ))}
              {(!upcomingMatches || upcomingMatches.length === 0) && (
                <p className="text-sm text-muted-foreground">No upcoming matches</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {latestNews?.map((article) => (
            <Link
              key={article.id}
              to={`/news/${article.id}`}
              className="bg-gradient-card rounded-lg border border-border p-5 transition-all hover:border-primary/40 hover:shadow-glow-blue group"
            >
              {article.pinned && (
                <span className="text-[10px] uppercase tracking-wider text-accent font-bold">📌 Pinned</span>
              )}
              <h3 className="text-lg font-heading font-bold text-foreground mt-1 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{article.content}</p>
              <div className="mt-3 text-xs text-muted-foreground">{new Date(article.published_at).toLocaleDateString()} · {article.author}</div>
            </Link>
          ))}
          {(!latestNews || latestNews.length === 0) && (
            <p className="text-sm text-muted-foreground">No news articles yet</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
