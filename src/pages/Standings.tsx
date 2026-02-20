import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Standings = () => {
  const { data: standings, isLoading } = useQuery({
    queryKey: ["standings-page"],
    queryFn: async () => {
      const { data, error } = await supabase.from("standings").select("*, teams(id, name, abbreviation, color)").order("pts", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">League Standings</h1>
      <p className="text-muted-foreground mb-8">Season 1 — 2026</p>

      <div className="bg-gradient-card rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted-foreground">
              <th className="text-left px-4 py-3 w-12">#</th>
              <th className="text-left px-4 py-3">Team</th>
              <th className="text-center px-3 py-3">GP</th>
              <th className="text-center px-3 py-3">W</th>
              <th className="text-center px-3 py-3">L</th>
              <th className="text-center px-3 py-3">OT</th>
              <th className="text-center px-3 py-3 text-primary font-bold">PTS</th>
              <th className="text-center px-3 py-3">GF</th>
              <th className="text-center px-3 py-3">GA</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="text-center py-6 text-muted-foreground">Loading...</td></tr>
            ) : standings?.map((s: any, i) => (
              <tr key={s.id} className={`border-b border-border/50 transition-colors hover:bg-secondary/50 ${i < 3 ? "bg-primary/5" : ""}`}>
                <td className="px-4 py-3 font-bold text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link to={`/teams/${s.teams?.id}`} className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: s.teams?.color }} />
                    {s.teams?.name}
                  </Link>
                </td>
                <td className="text-center px-3 py-3 text-muted-foreground">{s.gp}</td>
                <td className="text-center px-3 py-3">{s.w}</td>
                <td className="text-center px-3 py-3">{s.l}</td>
                <td className="text-center px-3 py-3">{s.ot}</td>
                <td className="text-center px-3 py-3 font-bold text-primary text-base">{s.pts}</td>
                <td className="text-center px-3 py-3 text-muted-foreground">{s.gf}</td>
                <td className="text-center px-3 py-3 text-muted-foreground">{s.ga}</td>
              </tr>
            ))}
            {!isLoading && (!standings || standings.length === 0) && (
              <tr><td colSpan={9} className="text-center py-6 text-muted-foreground">No standings data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Standings;
