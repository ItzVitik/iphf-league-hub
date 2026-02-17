import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { matches } from "@/lib/mock-data";

const MatchDetail = () => {
  const { id } = useParams();
  const match = matches.find((m) => m.id === id);

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground">Match not found</h1>
        <Link to="/matches" className="text-primary hover:underline mt-4 inline-block">← Back to Matches</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/matches" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All Matches
      </Link>

      <div className="bg-gradient-card rounded-lg border border-border p-6 md:p-8 mb-8 text-center">
        <div className="text-xs text-muted-foreground mb-2">{match.date} · {match.time} · {match.season}</div>
        <div className="flex items-center justify-center gap-6 mb-4">
          <span className="text-2xl md:text-3xl font-heading font-bold text-foreground">{match.teamA}</span>
          {match.status === "Finished" || match.status === "Live" ? (
            <span className="text-4xl md:text-5xl font-heading font-bold text-primary">{match.teamAScore} – {match.teamBScore}</span>
          ) : (
            <span className="text-2xl text-muted-foreground">VS</span>
          )}
          <span className="text-2xl md:text-3xl font-heading font-bold text-foreground">{match.teamB}</span>
        </div>
        <span className={`text-xs px-3 py-1 rounded font-semibold uppercase ${
          match.status === "Finished" ? "bg-muted text-muted-foreground" :
          match.status === "Live" ? "bg-live-green/20 text-live-green" :
          "bg-primary/20 text-primary"
        }`}>
          {match.status}
        </span>
        {match.mvp && <div className="mt-4 text-sm text-gold">⭐ MVP: {match.mvp}</div>}
      </div>

      {match.goals && match.goals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">Goal Summary</h2>
          <div className="bg-gradient-card rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">Team</th>
                  <th className="text-left px-4 py-3">Scorer</th>
                  <th className="text-left px-4 py-3">Assist</th>
                </tr>
              </thead>
              <tbody>
                {match.goals.map((g, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-2 text-muted-foreground">{g.time}</td>
                    <td className="px-4 py-2 font-semibold">{g.team}</td>
                    <td className="px-4 py-2 text-primary font-semibold">{g.scorer}</td>
                    <td className="px-4 py-2 text-muted-foreground">{g.assist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetail;
