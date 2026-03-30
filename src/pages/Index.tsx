import { Link } from "react-router-dom";
import { Trophy, Calendar, Users, BarChart3, ExternalLink, TrendingUp, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";
import iphfLogo from "@/assets/iphf-logo.png";
import FloatingParticles from "@/components/FloatingParticles";
import AnimatedCard from "@/components/AnimatedCard";

const Index = () => {
  const { data: standings } = useQuery({
    queryKey: ["home-standings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("standings").select("*, teams(id, name, abbreviation, color)").order("pts", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: players } = useQuery({
    queryKey: ["home-players"],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*, teams(name)").order("points", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: upcomingMatches } = useQuery({
    queryKey: ["home-upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase.from("matches").select("*, team_a:teams!team_a_id(name, abbreviation, color), team_b:teams!team_b_id(name, abbreviation, color)").eq("status", "Scheduled").order("match_date").limit(3);
      if (error) throw error;
      return data;
    },
  });

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
  const playerOfMonth = skaters[0];
  const standingsPreview = standings?.slice(0, 5) || [];

  return (
    <div className="relative">
      <FloatingParticles />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        </div>
        <div className="relative container mx-auto px-4 py-28 md:py-40 text-center z-10">
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl group-hover:bg-primary/40 transition-all duration-700 scale-150" />
              <img src={iphfLogo} alt="IPHF Logo" className="relative h-28 w-28 md:h-36 md:w-36 rounded-full shadow-glow-red transition-transform duration-500 group-hover:scale-110" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight text-foreground mb-4 animate-fade-in">
            INTERNATIONAL PUCK<br />
            <span className="text-gradient-accent">HOCKEY FEDERATION</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <p className="text-lg md:text-xl text-primary font-heading font-semibold tracking-wider uppercase">Season 1 — 2026</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <p className="text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
            The premier competitive Puck Hockey league. Eight teams. One champion.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Standings", icon: Trophy, path: "/standings" },
              { label: "Matches", icon: Calendar, path: "/matches" },
              { label: "Teams", icon: Users, path: "/teams" },
              { label: "Statistics", icon: BarChart3, path: "/statistics" },
            ].map((item, i) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2 rounded-lg bg-secondary/60 backdrop-blur-sm border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-primary/15 hover:border-primary/50 hover:shadow-glow-blue hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </Link>
            ))}
            <a
              href="https://discord.gg/iphf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-[#5865F2]/15 backdrop-blur-sm border border-[#5865F2]/30 px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-[#5865F2]/25 hover:-translate-y-0.5"
            >
              <ExternalLink className="h-4 w-4" />
              Discord
            </a>
          </div>
        </div>

        {/* Animated gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </section>

      {/* Stats Counter Bar */}
      <section className="relative z-10 container mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Teams", value: standings?.length || 8, icon: Shield },
            { label: "Players", value: players?.length || 0, icon: Users },
            { label: "Matches Played", value: standings?.reduce((a, s) => a + (s.gp || 0), 0) || 0, icon: Calendar },
            { label: "Total Goals", value: standings?.reduce((a, s) => a + (s.gf || 0), 0) || 0, icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="bg-secondary/50 backdrop-blur-md border border-border rounded-lg p-4 text-center">
              <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <div className="text-2xl font-heading font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Player Spotlight */}
      <section className="relative z-10 container mx-auto px-4 py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <h2 className="text-2xl font-heading font-bold text-foreground">Player Spotlight</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topScorer && (
            <AnimatedCard className="border-primary/20 p-6" glowColor="hsl(var(--primary))">
              <div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> Top Scorer
              </div>
              <div className="text-2xl font-heading font-bold text-foreground">{topScorer.name}</div>
              <div className="text-sm text-muted-foreground">{(topScorer as any).teams?.name || "Free Agent"}</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-heading font-bold text-primary">{topScorer.points}</span>
                <span className="text-sm text-muted-foreground font-medium">PTS</span>
              </div>
              <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                <span><span className="text-foreground font-semibold">{topScorer.goals}</span> G</span>
                <span><span className="text-foreground font-semibold">{topScorer.assists}</span> A</span>
                <span><span className="text-foreground font-semibold">{topScorer.gp}</span> GP</span>
              </div>
            </AnimatedCard>
          )}
          {bestGoalie && (
            <AnimatedCard className="border-accent/20 p-6" glowColor="hsl(var(--accent))">
              <div className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2 flex items-center gap-1.5">
                <Shield className="h-3 w-3" /> Best Goalie
              </div>
              <div className="text-2xl font-heading font-bold text-foreground">{bestGoalie.name}</div>
              <div className="text-sm text-muted-foreground">{(bestGoalie as any).teams?.name || "Free Agent"}</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-heading font-bold text-accent">
                  {bestGoalie.save_pct != null ? (Number(bestGoalie.save_pct) * 100).toFixed(1) : "0.0"}%
                </span>
                <span className="text-sm text-muted-foreground font-medium">SV%</span>
              </div>
              <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                <span><span className="text-foreground font-semibold">{bestGoalie.shutouts ?? 0}</span> SO</span>
                <span><span className="text-foreground font-semibold">{bestGoalie.saves ?? 0}</span> SVS</span>
                <span><span className="text-foreground font-semibold">{bestGoalie.gp}</span> GP</span>
              </div>
            </AnimatedCard>
          )}
          {playerOfMonth && (
            <AnimatedCard className="border-gold/20 p-6" glowColor="hsl(var(--gold))">
              <div className="text-[10px] uppercase tracking-widest text-gold font-bold mb-2 flex items-center gap-1.5">
                <Trophy className="h-3 w-3" /> Player of the Month
              </div>
              <div className="text-2xl font-heading font-bold text-foreground">{playerOfMonth.name}</div>
              <div className="text-sm text-muted-foreground">{(playerOfMonth as any).teams?.name || "Free Agent"}</div>
              <div className="mt-4 text-4xl">⭐</div>
              <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                <span><span className="text-foreground font-semibold">{playerOfMonth.points}</span> PTS</span>
                <span><span className="text-foreground font-semibold">{playerOfMonth.goals}</span> G</span>
                <span><span className="text-foreground font-semibold">{playerOfMonth.assists}</span> A</span>
              </div>
            </AnimatedCard>
          )}
        </div>
      </section>

      {/* Standings + Upcoming */}
      <section className="relative z-10 container mx-auto px-4 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-primary" />
                <h2 className="text-2xl font-heading font-bold text-foreground">Standings</h2>
              </div>
              <Link to="/standings" className="text-xs text-primary hover:underline font-medium transition-colors">View Full →</Link>
            </div>
            <div className="bg-gradient-card rounded-lg border border-border overflow-hidden backdrop-blur-sm">
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
                    <tr key={s.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors duration-200 group">
                      <td className="px-4 py-3 font-bold text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link to={`/teams/${s.teams?.id}`} className="flex items-center gap-2 font-semibold text-foreground group-hover:text-primary transition-colors">
                          {s.teams?.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.teams.color }} />}
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
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No standings data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-primary" />
                <h2 className="text-2xl font-heading font-bold text-foreground">Upcoming</h2>
              </div>
              <Link to="/matches" className="text-xs text-primary hover:underline font-medium transition-colors">All Matches →</Link>
            </div>
            <div className="space-y-3">
              {upcomingMatches?.map((match: any) => (
                <AnimatedCard key={match.id} className="p-4">
                  <Link to={`/matches/${match.id}`} className="block">
                    <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {match.match_date} · {match.match_time}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {match.team_a?.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: match.team_a.color }} />}
                        <span className="font-semibold text-foreground text-sm">{match.team_a?.abbreviation}</span>
                      </div>
                      <span className="text-xs text-muted-foreground px-3 py-1 rounded bg-secondary/50 font-heading font-bold">VS</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{match.team_b?.abbreviation}</span>
                        {match.team_b?.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: match.team_b.color }} />}
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-primary font-bold uppercase tracking-wider">Scheduled</div>
                  </Link>
                </AnimatedCard>
              ))}
              {(!upcomingMatches || upcomingMatches.length === 0) && (
                <p className="text-sm text-muted-foreground py-4">No upcoming matches</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="relative z-10 container mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <h2 className="text-2xl font-heading font-bold text-foreground">Latest News</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {latestNews?.map((article) => (
            <AnimatedCard key={article.id} className="group">
              <Link to={`/news/${article.id}`} className="block p-6">
                {article.pinned && (
                  <span className="inline-block text-[10px] uppercase tracking-widest text-accent font-bold mb-2 px-2 py-0.5 rounded bg-accent/10">📌 Pinned</span>
                )}
                <h3 className="text-lg font-heading font-bold text-foreground mt-1 group-hover:text-primary transition-colors duration-300">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{article.content}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  {new Date(article.published_at).toLocaleDateString()} · {article.author}
                </div>
              </Link>
            </AnimatedCard>
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
