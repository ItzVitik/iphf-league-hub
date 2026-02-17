import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { players } from "@/lib/mock-data";

const PlayerProfile = () => {
  const { id } = useParams();
  const player = players.find((p) => p.id === id);

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground">Player not found</h1>
        <Link to="/players" className="text-primary hover:underline mt-4 inline-block">← Back to Players</Link>
      </div>
    );
  }

  const isGoalie = player.position === "G";

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
            <Link to={`/teams/${player.teamId}`} className="hover:text-primary transition-colors">{player.teamName}</Link>
            <span>·</span>
            <span>{player.position === "F" ? "Forward" : player.position === "D" ? "Defense" : "Goalie"}</span>
            <span>·</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              player.status === "Active" ? "bg-live-green/20 text-live-green" :
              player.status === "Suspended" ? "bg-accent/20 text-accent" :
              "bg-gold/20 text-gold"
            }`}>
              {player.status}
            </span>
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
              { label: "+/−", value: player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus },
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
              { label: "Save %", value: `${((player.savePct ?? 0) * 100).toFixed(1)}%`, accent: true },
              { label: "Saves", value: player.saves },
              { label: "GAA", value: player.gaa?.toFixed(2) },
              { label: "Shutouts", value: player.shutouts },
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
