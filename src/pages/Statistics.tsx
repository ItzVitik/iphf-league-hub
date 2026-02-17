import { useState } from "react";
import { Link } from "react-router-dom";
import { players } from "@/lib/mock-data";

type Tab = "scorers" | "goals" | "assists" | "goalies" | "penalties";

const Statistics = () => {
  const [tab, setTab] = useState<Tab>("scorers");

  const skaters = players.filter((p) => p.position !== "G");
  const goalies = players.filter((p) => p.position === "G");

  const tabs: { id: Tab; label: string }[] = [
    { id: "scorers", label: "Top Scorers" },
    { id: "goals", label: "Top Goals" },
    { id: "assists", label: "Top Assists" },
    { id: "goalies", label: "Best Goalies" },
    { id: "penalties", label: "Penalty Leaders" },
  ];

  const getRows = () => {
    switch (tab) {
      case "scorers": return [...skaters].sort((a, b) => b.points - a.points);
      case "goals": return [...skaters].sort((a, b) => b.goals - a.goals);
      case "assists": return [...skaters].sort((a, b) => b.assists - a.assists);
      case "penalties": return [...skaters].sort((a, b) => b.pim - a.pim);
      default: return [];
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">Statistics</h1>
      <p className="text-muted-foreground mb-6">Season 1 Leaderboards</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "goalies" ? (
        <div className="bg-gradient-card rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Player</th>
                <th className="text-left px-4 py-3">Team</th>
                <th className="text-center px-3 py-3">GP</th>
                <th className="text-center px-3 py-3 text-primary">SV%</th>
                <th className="text-center px-3 py-3">SVS</th>
                <th className="text-center px-3 py-3">GAA</th>
                <th className="text-center px-3 py-3">SO</th>
              </tr>
            </thead>
            <tbody>
              {[...goalies].sort((a, b) => (b.savePct ?? 0) - (a.savePct ?? 0)).map((p, i) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link to={`/players/${p.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">{p.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.teamName}</td>
                  <td className="text-center px-3 py-3">{p.gp}</td>
                  <td className="text-center px-3 py-3 font-bold text-primary">{((p.savePct ?? 0) * 100).toFixed(1)}%</td>
                  <td className="text-center px-3 py-3">{p.saves}</td>
                  <td className="text-center px-3 py-3">{p.gaa?.toFixed(2)}</td>
                  <td className="text-center px-3 py-3">{p.shutouts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gradient-card rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Player</th>
                <th className="text-left px-4 py-3">Team</th>
                <th className="text-center px-3 py-3">GP</th>
                <th className="text-center px-3 py-3">G</th>
                <th className="text-center px-3 py-3">A</th>
                <th className="text-center px-3 py-3 text-primary">{tab === "penalties" ? "PIM" : "PTS"}</th>
                <th className="text-center px-3 py-3">+/−</th>
              </tr>
            </thead>
            <tbody>
              {getRows().map((p, i) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link to={`/players/${p.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">{p.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.teamName}</td>
                  <td className="text-center px-3 py-3">{p.gp}</td>
                  <td className="text-center px-3 py-3">{p.goals}</td>
                  <td className="text-center px-3 py-3">{p.assists}</td>
                  <td className="text-center px-3 py-3 font-bold text-primary">{tab === "penalties" ? p.pim : p.points}</td>
                  <td className="text-center px-3 py-3 text-muted-foreground">{p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Statistics;
