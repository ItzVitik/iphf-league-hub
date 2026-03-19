import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Standings = () => {
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["standings-groups"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("groups")
        .select("*, group_teams(team_id, teams(id, name, abbreviation, color, logo_url))")
        .order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: allStandings, isLoading: standingsLoading } = useQuery({
    queryKey: ["standings-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("standings")
        .select("*, teams(id, name, abbreviation, color, logo_url)")
        .order("pts", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const isLoading = groupsLoading || standingsLoading;

  // Build a map of team_id -> standing row
  const standingsByTeam: Record<string, any> = {};
  allStandings?.forEach((s: any) => { standingsByTeam[s.team_id] = s; });

  // Build grouped standings
  const groupedData = groups?.map((g: any) => ({
    ...g,
    teams: (g.group_teams || [])
      .map((gt: any) => standingsByTeam[gt.team_id] || { team_id: gt.team_id, teams: gt.teams, gp: 0, w: 0, otw: 0, l: 0, ot: 0, pts: 0, gf: 0, ga: 0 })
      .sort((a: any, b: any) => (b.pts || 0) - (a.pts || 0)),
  }));

  // Teams not in any group
  const teamsInGroups = new Set(groups?.flatMap((g: any) => (g.group_teams || []).map((gt: any) => gt.team_id)) || []);
  const ungroupedStandings = allStandings?.filter((s: any) => !teamsInGroups.has(s.team_id)) || [];

  const StandingsTable = ({ rows, showRank }: { rows: any[]; showRank?: boolean }) => (
    <div className="bg-gradient-card rounded-lg border border-border overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="border-b border-border text-xs uppercase text-muted-foreground">
            {showRank && <th className="text-left px-4 py-3 w-10">#</th>}
            <th className="text-left px-4 py-3">Team</th>
            <th className="text-center px-3 py-3">GP</th>
            <th className="text-center px-3 py-3">W</th>
            <th className="text-center px-3 py-3">OTW</th>
            <th className="text-center px-3 py-3">L</th>
            <th className="text-center px-3 py-3">OTL</th>
            <th className="text-center px-3 py-3 text-primary font-bold">PTS</th>
            <th className="text-center px-3 py-3">GF</th>
            <th className="text-center px-3 py-3">GA</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={showRank ? 10 : 9} className="text-center py-6 text-muted-foreground">No standings data yet</td></tr>
          ) : rows.map((s: any, i) => (
            <tr key={s.id || s.team_id} className={`border-b border-border/50 transition-colors hover:bg-secondary/50 ${i < 2 ? "bg-primary/5" : ""}`}>
              {showRank && <td className="px-4 py-3 font-bold text-muted-foreground">{i + 1}</td>}
              <td className="px-4 py-3">
                <Link to={`/teams/${s.teams?.id || s.team_id}`} className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2">
                  {s.teams?.logo_url ? (
                    <img src={s.teams.logo_url} alt={s.teams?.name} className="w-6 h-6 object-contain rounded-sm" />
                  ) : (
                    <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: s.teams?.color || "#888" }} />
                  )}
                  {s.teams?.name || "Unknown"}
                </Link>
              </td>
              <td className="text-center px-3 py-3 text-muted-foreground">{s.gp}</td>
              <td className="text-center px-3 py-3">{s.w}</td>
              <td className="text-center px-3 py-3 text-accent">{s.otw ?? 0}</td>
              <td className="text-center px-3 py-3">{s.l}</td>
              <td className="text-center px-3 py-3 text-muted-foreground">{s.ot}</td>
              <td className="text-center px-3 py-3 font-bold text-primary text-base">{s.pts}</td>
              <td className="text-center px-3 py-3 text-muted-foreground">{s.gf}</td>
              <td className="text-center px-3 py-3 text-muted-foreground">{s.ga}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">League Standings</h1>
      <p className="text-muted-foreground mb-2">Season 1 — 2026</p>
      <p className="text-xs text-muted-foreground mb-8">W=2pts · OTW=2pts · OTL=1pt · L=0pts</p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : groupedData && groupedData.length > 0 ? (
        <div className="space-y-10">
          {groupedData.map((g: any) => (
            <div key={g.id}>
              <h2 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-6 rounded bg-primary inline-block" />
                {g.name}
              </h2>
              <StandingsTable rows={g.teams} showRank />
            </div>
          ))}
          {ungroupedStandings.length > 0 && (
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-4">Ungrouped Teams</h2>
              <StandingsTable rows={ungroupedStandings} showRank />
            </div>
          )}
        </div>
      ) : (
        <StandingsTable rows={allStandings || []} showRank />
      )}
    </div>
  );
};

export default Standings;
