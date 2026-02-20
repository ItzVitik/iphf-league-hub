import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PlayerProfile = () => {
  const { id } = useParams();

  const { data: player, isLoading } = useQuery({
    queryKey: ["player-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*, teams(id, name)").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="container mx-auto px-4 py-10"><p className="text-muted-foreground">Loading...</p></div>;

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground">Player not found</h1>
        <Link to="/players" className="text-primary hover:underline mt-4 inline-block">← Back to Players</Link>
      </div>
    );
  }

  const isGoalie = player.position === "G";
  const teamData = (player as any).teams;

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/players" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All Players
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold font-heading text-primary">
          {player.jersey ?? "—"}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{player.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            {teamData && <Link to={`/teams/${teamData.id}`} className="hover:text-primary transition-colors">{teamData.name}</Link>}
            {!teamData && <span>Free Agent</span>}
            <span>·</span>
            <span>{player.position === "F" ? "Forward" : player.position === "D" ? "Defense" : "Goalie"}</span>
            <span>·</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              player.status === "Active" ? "bg-live-green/20 text-live-green" :
              player.status === "Suspended" ? "bg-accent/20 text-accent" :
              "bg-gold/20 text-gold"
            }`}>{player.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {!isGoalie ? (
          <>
            {[
              { label: "Goals", value: player.goals },
              { label: "Assists", value: player.assists },
              { label: "Points", value: player.points, accent: true },
              { label: "Games Played", value: player.gp },
              { label: "+/−", value: player.plus_minus > 0 ? `+${player.plus_minus}` : player.plus_minus },
              { label: "PIM", value: player.pim },
            ].map((stat) => (
              <div key={stat.label} className="bg-gradient-card rounded-lg border border-border p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</div>
                <div className={`text-2xl font-heading font-bold ${stat.accent ? "text-primary" : "text-foreground"}`}>{stat.value}</div>
              </div>
            ))}
          </>
        ) : (
          <>
            {[
              { label: "Save %", value: `${player.save_pct != null ? (Number(player.save_pct) * 100).toFixed(1) : "0.0"}%`, accent: true },
              { label: "Saves", value: player.saves ?? 0 },
              { label: "GAA", value: player.gaa != null ? Number(player.gaa).toFixed(2) : "—" },
              { label: "Shutouts", value: player.shutouts ?? 0 },
              { label: "Games Played", value: player.gp },
            ].map((stat) => (
              <div key={stat.label} className="bg-gradient-card rounded-lg border border-border p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</div>
                <div className={`text-2xl font-heading font-bold ${stat.accent ? "text-primary" : "text-foreground"}`}>{stat.value}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;
