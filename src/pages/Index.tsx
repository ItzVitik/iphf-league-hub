import { Link } from "react-router-dom";
import { Shield, Trophy, Calendar, Users, BarChart3, ExternalLink } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { teams, players, matches, news } from "@/lib/mock-data";

const Index = () => {
  const upcomingMatches = matches.filter((m) => m.status === "Scheduled").slice(0, 3);
  const topScorers = [...players].filter((p) => p.position !== "G").sort((a, b) => b.points - a.points).slice(0, 3);
  const bestGoalie = [...players].filter((p) => p.position === "G").sort((a, b) => (b.savePct ?? 0) - (a.savePct ?? 0))[0];
  const standingsPreview = [...teams].sort((a, b) => b.pts - a.pts).slice(0, 5);
  const latestNews = news.slice(0, 3);

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
            <Shield className="h-16 w-16 md:h-20 md:w-20 text-primary" />
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
          {topScorers[0] && (
            <div className="bg-gradient-card rounded-lg border border-primary/20 p-5 shadow-glow-blue">
              <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Top Scorer</div>
              <div className="text-xl font-heading font-bold text-foreground">{topScorers[0].name}</div>
              <div className="text-sm text-muted-foreground">{topScorers[0].teamName}</div>
              <div className="mt-3 text-3xl font-heading font-bold text-primary">{topScorers[0].points} <span className="text-sm text-muted-foreground font-body">PTS</span></div>
              <div className="text-xs text-muted-foreground">{topScorers[0].goals}G · {topScorers[0].assists}A</div>
            </div>
          )}
          {bestGoalie && (
            <div className="bg-gradient-card rounded-lg border border-accent/20 p-5 shadow-glow-red">
              <div className="text-xs uppercase tracking-wider text-accent font-semibold mb-1">Best Goalie</div>
              <div className="text-xl font-heading font-bold text-foreground">{bestGoalie.name}</div>
              <div className="text-sm text-muted-foreground">{bestGoalie.teamName}</div>
              <div className="mt-3 text-3xl font-heading font-bold text-accent">{((bestGoalie.savePct ?? 0) * 100).toFixed(1)}%<span className="text-sm text-muted-foreground font-body ml-1">SV%</span></div>
              <div className="text-xs text-muted-foreground">{bestGoalie.shutouts} SO · {bestGoalie.saves} SVS</div>
            </div>
          )}
          {topScorers[0] && (
            <div className="bg-gradient-card rounded-lg border border-gold/20 p-5">
              <div className="text-xs uppercase tracking-wider text-gold font-semibold mb-1">Player of the Week</div>
              <div className="text-xl font-heading font-bold text-foreground">{topScorers[0].name}</div>
              <div className="text-sm text-muted-foreground">{topScorers[0].teamName}</div>
              <div className="mt-3 text-3xl font-heading font-bold text-gold">⭐</div>
              <div className="text-xs text-muted-foreground">Hat trick vs Red Storm</div>
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
                  {standingsPreview.map((team, i) => (
                    <tr key={team.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link to={`/teams/${team.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                          {team.name}
                        </Link>
                      </td>
                      <td className="text-center px-2 py-3 text-muted-foreground">{team.gp}</td>
                      <td className="text-center px-2 py-3">{team.w}</td>
                      <td className="text-center px-2 py-3">{team.l}</td>
                      <td className="text-center px-2 py-3">{team.ot}</td>
                      <td className="text-center px-2 py-3 font-bold text-primary">{team.pts}</td>
                    </tr>
                  ))}
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
              {upcomingMatches.map((match) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="block bg-gradient-card rounded-lg border border-border p-4 transition-all hover:border-primary/40 hover:shadow-glow-blue"
                >
                  <div className="text-xs text-muted-foreground mb-2">{match.date} · {match.time}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm">{match.teamA}</span>
                    <span className="text-xs text-muted-foreground px-2">VS</span>
                    <span className="font-semibold text-foreground text-sm">{match.teamB}</span>
                  </div>
                  <div className="mt-2 text-xs text-primary font-medium uppercase">Scheduled</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {latestNews.map((article) => (
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
              <div className="mt-3 text-xs text-muted-foreground">{article.date} · {article.author}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
