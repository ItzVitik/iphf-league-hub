import { Link } from "react-router-dom";
import { teams } from "@/lib/mock-data";

const Teams = () => {
  const sorted = [...teams].sort((a, b) => b.pts - a.pts);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">Teams</h1>
      <p className="text-muted-foreground mb-8">Season 1 — 8 Teams</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sorted.map((team) => (
          <Link
            key={team.id}
            to={`/teams/${team.id}`}
            className="bg-gradient-card rounded-lg border border-border p-5 transition-all hover:border-primary/40 hover:shadow-glow-blue group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-heading" style={{ backgroundColor: team.color + "30", color: team.color }}>
                {team.abbreviation}
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">{team.name}</h3>
                <p className="text-xs text-muted-foreground">{team.gm ? `GM: ${team.gm}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{team.w}W – {team.l}L – {team.ot}OT</span>
              <span className="font-bold text-primary">{team.pts} PTS</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Teams;
