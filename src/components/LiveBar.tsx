import { Radio, Wifi, WifiOff } from "lucide-react";

interface LiveBarProps {
  isLive: boolean;
  teamA?: string;
  teamB?: string;
  streamUrl?: string;
  score?: { teamA: number; teamB: number };
}

const LiveBar = ({ isLive, teamA, teamB, streamUrl, score }: LiveBarProps) => {
  if (isLive) {
    return (
      <div className="bg-live-green/10 border-b border-live-green/30">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded bg-live-green px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary-foreground animate-pulse-live">
              <Radio className="h-3 w-3" /> Live Now
            </span>
            <span className="text-sm font-semibold text-foreground">
              {teamA} <span className="text-muted-foreground mx-1">{score?.teamA} – {score?.teamB}</span> {teamB}
            </span>
          </div>
          {streamUrl && (
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground transition-colors hover:bg-accent/80"
            >
              <Wifi className="h-3 w-3" /> Watch Stream
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-secondary/50">
      <div className="container mx-auto flex items-center px-4 py-1.5">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <WifiOff className="h-3 w-3" /> OFFLINE — No active broadcast
        </span>
      </div>
    </div>
  );
};

export default LiveBar;
