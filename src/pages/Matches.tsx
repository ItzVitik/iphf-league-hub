import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  Scheduled: "bg-primary/20 text-primary",
  Live: "bg-live-green/20 text-live-green",
  Finished: "bg-muted text-muted-foreground",
};

const Matches = () => {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [teamFilter, setTeamFilter] = useState<string>("All");

  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches-page"],
    queryFn: async () => {
      const { data, error } = await supabase.from("matches").select("*, team_a:teams!team_a_id(id, name), team_b:teams!team_b_id(id, name)").order("match_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: teams } = useQuery({
    queryKey: ["teams-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = (matches || []).filter((m: any) => {
    if (statusFilter !== "All" && m.status !== statusFilter) return false;
    if (teamFilter !== "All" && m.team_a?.name !== teamFilter && m.team_b?.name !== teamFilter) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">Matches</h1>
      <p className="text-muted-foreground mb-6">Season 1 — 2026</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground">
          <option>All</option>
          <option>Scheduled</option>
          <option>Live</option>
          <option>Finished</option>
        </select>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground">
          <option>All</option>
          {teams?.map((t) => <option key={t.id}>{t.name}</option>)}
        </select>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((match: any) => (
            <Link
              key={match.id}
              to={`/matches/${match.id}`}
              className="bg-gradient-card rounded-lg border border-border p-5 transition-all hover:border-primary/40 hover:shadow-glow-blue"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{match.match_date} · {match.match_time}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase ${statusColors[match.status] || ""}`}>
                  {match.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-lg text-foreground">{match.team_a?.name}</span>
                {match.status === "Finished" ? (
                  <span className="text-xl font-heading font-bold text-primary">{match.team_a_score} – {match.team_b_score}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">VS</span>
                )}
                <span className="font-heading font-bold text-lg text-foreground">{match.team_b?.name}</span>
              </div>
              {match.mvp && <div className="mt-2 text-xs text-gold">⭐ MVP: {match.mvp}</div>}
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground">No matches found.</p>}
        </div>
      )}
    </div>
  );
};

export default Matches;
