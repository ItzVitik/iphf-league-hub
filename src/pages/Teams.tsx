import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Teams = () => {
  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams-page"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*, standings(gp, w, l, ot, otw, pts, gf, ga)").order("name");
      if (error) throw error;
      return data;
    },
  });

  const sorted = [...(teams || [])].sort((a: any, b: any) => (b.standings?.[0]?.pts || 0) - (a.standings?.[0]?.pts || 0));

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">Teams</h1>
      <p className="text-muted-foreground mb-8">Season 1 — {sorted.length} Teams</p>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sorted.map((team: any) => {
            const s = team.standings?.[0];
            return (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="bg-gradient-card rounded-lg border border-border p-5 transition-all hover:border-primary/40 hover:shadow-glow-blue group"
              >
                <div className="flex items-center gap-3 mb-4">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-10 h-10 object-contain rounded" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-heading" style={{ backgroundColor: team.color + "30", color: team.color }}>
                      {team.abbreviation}
                    </div>
                  )}
                  <div>
                    <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">{team.name}</h3>
                    <p className="text-xs text-muted-foreground">{team.gm ? `GM: ${team.gm}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s?.w || 0}W – {s?.l || 0}L – {s?.ot || 0}OTL</span>
                  <span className="font-bold text-primary">{s?.pts || 0} PTS</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Teams;
