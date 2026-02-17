import { Link } from "react-router-dom";
import { players } from "@/lib/mock-data";

const Players = () => {
  const sorted = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">Players</h1>
      <p className="text-muted-foreground mb-8">All registered players</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((p) => (
          <Link
            key={p.id}
            to={`/players/${p.id}`}
            className="bg-gradient-card rounded-lg border border-border p-5 transition-all hover:border-primary/40 hover:shadow-glow-blue group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {p.position === "F" ? "Forward" : p.position === "D" ? "Defense" : "Goalie"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                p.status === "Active" ? "bg-live-green/20 text-live-green" :
                p.status === "Suspended" ? "bg-accent/20 text-accent" :
                "bg-gold/20 text-gold"
              }`}>
                {p.status}
              </span>
            </div>
            <h3 className="text-lg font-heading font-bold text-foreground group-hover:text-primary transition-colors">
              {p.jersey && <span className="text-muted-foreground mr-2">#{p.jersey}</span>}
              {p.name}
            </h3>
            <p className="text-sm text-muted-foreground">{p.teamName}</p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              {p.position !== "G" ? (
                <>
                  <span><strong className="text-foreground">{p.goals}</strong> G</span>
                  <span><strong className="text-foreground">{p.assists}</strong> A</span>
                  <span className="font-bold text-primary">{p.points} PTS</span>
                </>
              ) : (
                <>
                  <span><strong className="text-foreground">{((p.savePct ?? 0) * 100).toFixed(1)}%</strong> SV%</span>
                  <span><strong className="text-foreground">{p.shutouts}</strong> SO</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Players;
