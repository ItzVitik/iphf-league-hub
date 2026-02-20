import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TeamProfile = () => {
  const { id } = useParams();

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["team-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*, standings(gp, w, l, ot, pts, gf, ga)").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: roster } = useQuery({
    queryKey: ["team-roster", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*").eq("team_id", id!).order("points", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: teamMatches } = useQuery({
    queryKey: ["team-matches", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("matches").select("*, team_a:teams!team_a_id(id, name), team_b:teams!team_b_id(id, name)").or(`team_a_id.eq.${id},team_b_id.eq.${id}`).order("match_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (teamLoading) return <div className="container mx-auto px-4 py-10"><p className="text-muted-foreground">Loading...</p></div>;

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground">Team not found</h1>
        <Link to="/teams" className="text-primary hover:underline mt-4 inline-block">← Back to Teams</Link>
      </div>
    );
  }

  const s = (team as any).standings?.[0];
  const upcoming = (teamMatches || []).filter((m: any) => m.status === "Scheduled").slice(0, 3);
  const recent = (teamMatches || []).filter((m: any) => m.status === "Finished").slice(0, 3);
  const winPct = s && s.gp > 0 ? ((s.w / s.gp) * 100).toFixed(1) : "0.0";

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/teams" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All Teams
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold font-heading" style={{ backgroundColor: team.color + "30", color: team.color }}>
          {team.abbreviation}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{team.name}</h1>
          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
            {team.gm && <span>GM: <strong className="text-foreground">{team.gm}</strong></span>}
            {team.coach && <span>Coach: <strong className="text-foreground">{team.coach}</strong></span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Points", value: s?.pts ?? 0, accent: true },
          { label: "Record", value: `${s?.w ?? 0}-${s?.l ?? 0}-${s?.ot ?? 0}` },
          { label: "Win %", value: `${winPct}%` },
          { label: "Goals For", value: s?.gf ?? 0 },
          { label: "Goals Against", value: s?.ga ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-gradient-card rounded-lg border border-border p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</div>
            <div className={`text-2xl font-heading font-bold ${stat.accent ? "text-primary" : "text-foreground"}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Roster</h2>
      <div className="bg-gradient-card rounded-lg border border-border overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted-foreground">
              <th className="text-left px-4 py-3">Player</th>
              <th className="text-center px-3 py-3">Pos</th>
              <th className="text-center px-3 py-3">#</th>
              <th className="text-center px-3 py-3">GP</th>
              <th className="text-center px-3 py-3">G</th>
              <th className="text-center px-3 py-3">A</th>
              <th className="text-center px-3 py-3">PTS</th>
              <th className="text-center px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {roster?.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/players/${p.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">{p.name}</Link>
                </td>
                <td className="text-center px-3 py-3 text-muted-foreground">{p.position}</td>
                <td className="text-center px-3 py-3 text-muted-foreground">{p.jersey ?? "—"}</td>
                <td className="text-center px-3 py-3">{p.gp}</td>
                <td className="text-center px-3 py-3">{p.goals}</td>
                <td className="text-center px-3 py-3">{p.assists}</td>
                <td className="text-center px-3 py-3 font-bold text-primary">{p.points}</td>
                <td className="text-center px-3 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    p.status === "Active" ? "bg-live-green/20 text-live-green" :
                    p.status === "Suspended" ? "bg-accent/20 text-accent" :
                    "bg-gold/20 text-gold"
                  }`}>{p.status}</span>
                </td>
              </tr>
            ))}
            {(!roster || roster.length === 0) && <tr><td colSpan={8} className="text-center py-6 text-muted-foreground">No players on roster</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">Upcoming Matches</h2>
          <div className="space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming matches</p>}
            {upcoming.map((m: any) => (
              <Link key={m.id} to={`/matches/${m.id}`} className="block bg-secondary/50 rounded border border-border p-3 hover:border-primary/40 transition-colors">
                <div className="text-xs text-muted-foreground">{m.match_date} · {m.match_time}</div>
                <div className="font-semibold text-sm">{m.team_a?.name} vs {m.team_b?.name}</div>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">Recent Results</h2>
          <div className="space-y-2">
            {recent.length === 0 && <p className="text-sm text-muted-foreground">No recent results</p>}
            {recent.map((m: any) => (
              <Link key={m.id} to={`/matches/${m.id}`} className="block bg-secondary/50 rounded border border-border p-3 hover:border-primary/40 transition-colors">
                <div className="text-xs text-muted-foreground">{m.match_date}</div>
                <div className="font-semibold text-sm">{m.team_a?.name} {m.team_a_score} – {m.team_b_score} {m.team_b?.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;
