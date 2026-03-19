import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

const ROUNDS = ["Quarter-Final", "Semi-Final", "Final"];

const TeamCard = ({ team, isWinner }: { team: any; isWinner?: boolean }) => {
  if (!team) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded bg-secondary/30 border border-border/40 text-muted-foreground text-sm">
      <span className="w-5 h-5 rounded bg-border/50" />
      TBD
    </div>
  );
  return (
    <Link
      to={`/teams/${team.id}`}
      className={`flex items-center gap-2 px-3 py-2 rounded border text-sm font-semibold transition-colors
        ${isWinner ? "bg-primary/10 border-primary/40 text-primary" : "bg-secondary/50 border-border text-foreground hover:border-primary/30"}`}
    >
      {team.logo_url ? (
        <img src={team.logo_url} alt={team.name} className="w-5 h-5 object-contain rounded-sm" />
      ) : (
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: team.color || "#888" }} />
      )}
      {team.name}
      {isWinner && <Trophy className="h-3.5 w-3.5 ml-auto text-primary" />}
    </Link>
  );
};

const MatchupCard = ({ matchup }: { matchup: any }) => (
  <div className="bg-gradient-card border border-border rounded-lg p-4 w-56 space-y-2">
    <TeamCard team={matchup.team_a} isWinner={matchup.winner_id && matchup.winner_id === matchup.team_a_id} />
    <div className="text-center text-xs text-muted-foreground font-medium">VS</div>
    <TeamCard team={matchup.team_b} isWinner={matchup.winner_id && matchup.winner_id === matchup.team_b_id} />
    {matchup.match_id && (
      <Link to={`/matches/${matchup.match_id}`} className="block text-center text-[11px] text-primary hover:underline mt-1">
        View Match →
      </Link>
    )}
  </div>
);

const Playoffs = () => {
  const { data: playoffData, isLoading } = useQuery({
    queryKey: ["playoffs-page"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("playoffs")
        .select("*, team_a:teams!team_a_id(id, name, color, logo_url), team_b:teams!team_b_id(id, name, color, logo_url), winner:teams!winner_id(id, name)")
        .order("bracket_position");
      if (error) throw error;
      return data as any[];
    },
  });

  const byRound: Record<string, any[]> = {};
  playoffData?.forEach((p: any) => {
    if (!byRound[p.round]) byRound[p.round] = [];
    byRound[p.round].push(p);
  });

  const activeRounds = ROUNDS.filter(r => byRound[r]?.length);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">Playoffs</h1>
      <p className="text-muted-foreground mb-10">Season 1 — 2026 · Single Elimination Bracket</p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : activeRounds.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Playoffs haven't started yet</p>
          <p className="text-sm mt-1">Check back when the group stage is complete.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 overflow-x-auto pb-4">
          {ROUNDS.filter(r => byRound[r]).map((round, roundIdx) => (
            <div key={round} className="flex flex-col items-center gap-6">
              <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-muted-foreground mb-2">{round}</h2>
              <div className="flex flex-col gap-6">
                {byRound[round].sort((a: any, b: any) => a.bracket_position - b.bracket_position).map((m: any) => (
                  <MatchupCard key={m.id} matchup={m} />
                ))}
              </div>
              {roundIdx < ROUNDS.filter(r => byRound[r]).length - 1 && (
                <div className="hidden lg:block w-8 h-px bg-border absolute" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playoffs;
