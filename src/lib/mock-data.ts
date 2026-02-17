export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
  gp: number;
  w: number;
  l: number;
  ot: number;
  pts: number;
  gf: number;
  ga: number;
  gm?: string;
  coach?: string;
  discord?: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  role: "Player";
  position: "F" | "D" | "G";
  jersey?: number;
  status: "Active" | "Suspended" | "Injured";
  gp: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
  // goalie stats
  saves?: number;
  savePct?: number;
  gaa?: number;
  shutouts?: number;
}

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  teamAScore?: number;
  teamBScore?: number;
  date: string;
  time: string;
  status: "Scheduled" | "Live" | "Finished";
  season: string;
  mvp?: string;
  goals?: { time: string; team: string; scorer: string; assist: string }[];
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  pinned: boolean;
  image?: string;
}

export const teams: Team[] = [
  { id: "arctic-wolves", name: "Arctic Wolves", abbreviation: "AW", color: "#3b82f6", gp: 12, w: 9, l: 2, ot: 1, pts: 19, gf: 38, ga: 18, gm: "FrostByte", coach: "IceGeneral" },
  { id: "red-storm", name: "Red Storm", abbreviation: "RS", color: "#ef4444", gp: 12, w: 8, l: 3, ot: 1, pts: 17, gf: 35, ga: 22, gm: "ThunderStrike", coach: "BlazeMaster" },
  { id: "shadow-bears", name: "Shadow Bears", abbreviation: "SB", color: "#8b5cf6", gp: 12, w: 7, l: 4, ot: 1, pts: 15, gf: 30, ga: 24, gm: "DarkPaw", coach: "NightOwl" },
  { id: "iron-eagles", name: "Iron Eagles", abbreviation: "IE", color: "#f59e0b", gp: 12, w: 6, l: 4, ot: 2, pts: 14, gf: 28, ga: 25, gm: "SteelWing", coach: "SkyHawk" },
  { id: "frost-titans", name: "Frost Titans", abbreviation: "FT", color: "#06b6d4", gp: 12, w: 5, l: 5, ot: 2, pts: 12, gf: 26, ga: 27, gm: "GlacierKing", coach: "IceLord" },
  { id: "crimson-vipers", name: "Crimson Vipers", abbreviation: "CV", color: "#dc2626", gp: 12, w: 4, l: 6, ot: 2, pts: 10, gf: 22, ga: 30, gm: "VenomFang", coach: "CobraStrike" },
  { id: "nordic-knights", name: "Nordic Knights", abbreviation: "NK", color: "#a855f7", gp: 12, w: 3, l: 7, ot: 2, pts: 8, gf: 20, ga: 32, gm: "ShieldBearer", coach: "SwordMaster" },
  { id: "blue-phantoms", name: "Blue Phantoms", abbreviation: "BP", color: "#6366f1", gp: 12, w: 2, l: 8, ot: 2, pts: 6, gf: 16, ga: 37, gm: "GhostPuck", coach: "SpiritGuide" },
].sort((a, b) => b.pts - a.pts);

export const players: Player[] = [
  { id: "p1", name: "SnipeKing", teamId: "arctic-wolves", teamName: "Arctic Wolves", role: "Player", position: "F", jersey: 91, status: "Active", gp: 12, goals: 14, assists: 10, points: 24, plusMinus: 12, pim: 4 },
  { id: "p2", name: "RocketShot", teamId: "red-storm", teamName: "Red Storm", role: "Player", position: "F", jersey: 87, status: "Active", gp: 12, goals: 12, assists: 11, points: 23, plusMinus: 8, pim: 6 },
  { id: "p3", name: "PlayMaker", teamId: "arctic-wolves", teamName: "Arctic Wolves", role: "Player", position: "F", jersey: 10, status: "Active", gp: 12, goals: 6, assists: 16, points: 22, plusMinus: 10, pim: 2 },
  { id: "p4", name: "IronWall", teamId: "shadow-bears", teamName: "Shadow Bears", role: "Player", position: "D", jersey: 4, status: "Active", gp: 12, goals: 3, assists: 14, points: 17, plusMinus: 6, pim: 10 },
  { id: "p5", name: "BlueLineBomber", teamId: "iron-eagles", teamName: "Iron Eagles", role: "Player", position: "D", jersey: 77, status: "Active", gp: 12, goals: 8, assists: 8, points: 16, plusMinus: 4, pim: 8 },
  { id: "p6", name: "FlashSave", teamId: "arctic-wolves", teamName: "Arctic Wolves", role: "Player", position: "G", jersey: 30, status: "Active", gp: 12, goals: 0, assists: 1, points: 1, plusMinus: 0, pim: 0, saves: 312, savePct: 0.945, gaa: 1.5, shutouts: 3 },
  { id: "p7", name: "TheWall", teamId: "red-storm", teamName: "Red Storm", role: "Player", position: "G", jersey: 35, status: "Active", gp: 12, goals: 0, assists: 0, points: 0, plusMinus: 0, pim: 0, saves: 298, savePct: 0.932, gaa: 1.83, shutouts: 2 },
  { id: "p8", name: "ShadowStrike", teamId: "shadow-bears", teamName: "Shadow Bears", role: "Player", position: "F", jersey: 19, status: "Active", gp: 12, goals: 10, assists: 7, points: 17, plusMinus: 5, pim: 12 },
  { id: "p9", name: "ViperFang", teamId: "crimson-vipers", teamName: "Crimson Vipers", role: "Player", position: "F", jersey: 13, status: "Suspended", gp: 10, goals: 9, assists: 5, points: 14, plusMinus: -2, pim: 24 },
  { id: "p10", name: "NightBlade", teamId: "nordic-knights", teamName: "Nordic Knights", role: "Player", position: "F", jersey: 22, status: "Active", gp: 12, goals: 7, assists: 6, points: 13, plusMinus: -4, pim: 8 },
  { id: "p11", name: "IcePhantom", teamId: "blue-phantoms", teamName: "Blue Phantoms", role: "Player", position: "F", jersey: 88, status: "Active", gp: 12, goals: 6, assists: 5, points: 11, plusMinus: -8, pim: 6 },
  { id: "p12", name: "TitanGuard", teamId: "frost-titans", teamName: "Frost Titans", role: "Player", position: "D", jersey: 5, status: "Active", gp: 12, goals: 2, assists: 9, points: 11, plusMinus: 1, pim: 14 },
];

export const matches: Match[] = [
  { id: "m1", teamA: "Arctic Wolves", teamB: "Red Storm", teamAScore: 4, teamBScore: 2, date: "2025-01-15", time: "20:00", status: "Finished", season: "Season 1", mvp: "SnipeKing", goals: [
    { time: "05:32", team: "Arctic Wolves", scorer: "SnipeKing", assist: "PlayMaker" },
    { time: "12:10", team: "Red Storm", scorer: "RocketShot", assist: "—" },
    { time: "28:45", team: "Arctic Wolves", scorer: "PlayMaker", assist: "SnipeKing" },
    { time: "35:00", team: "Red Storm", scorer: "RocketShot", assist: "—" },
    { time: "48:20", team: "Arctic Wolves", scorer: "SnipeKing", assist: "PlayMaker" },
    { time: "55:10", team: "Arctic Wolves", scorer: "SnipeKing", assist: "—" },
  ]},
  { id: "m2", teamA: "Shadow Bears", teamB: "Iron Eagles", teamAScore: 3, teamBScore: 3, date: "2025-01-16", time: "19:00", status: "Finished", season: "Season 1", mvp: "IronWall" },
  { id: "m3", teamA: "Frost Titans", teamB: "Crimson Vipers", teamAScore: 2, teamBScore: 1, date: "2025-01-17", time: "21:00", status: "Finished", season: "Season 1" },
  { id: "m4", teamA: "Nordic Knights", teamB: "Blue Phantoms", teamAScore: 4, teamBScore: 3, date: "2025-01-18", time: "20:00", status: "Finished", season: "Season 1" },
  { id: "m5", teamA: "Arctic Wolves", teamB: "Shadow Bears", date: "2025-02-20", time: "20:00", status: "Scheduled", season: "Season 1" },
  { id: "m6", teamA: "Red Storm", teamB: "Frost Titans", date: "2025-02-21", time: "19:00", status: "Scheduled", season: "Season 1" },
  { id: "m7", teamA: "Iron Eagles", teamB: "Crimson Vipers", date: "2025-02-22", time: "21:00", status: "Scheduled", season: "Season 1" },
  { id: "m8", teamA: "Nordic Knights", teamB: "Arctic Wolves", date: "2025-02-25", time: "20:00", status: "Scheduled", season: "Season 1" },
];

export const news: NewsArticle[] = [
  { id: "n1", title: "IPHF Season 1 Officially Kicks Off!", content: "The International Puck Hockey Federation is proud to announce the start of Season 1. Eight teams are ready to battle for the championship title.", date: "2025-01-10", author: "IPHF Admin", pinned: true },
  { id: "n2", title: "Arctic Wolves Dominate Opening Week", content: "The Arctic Wolves have stormed to the top of the standings with a perfect 3-0 record in the first week. SnipeKing leads all scorers with 8 points.", date: "2025-01-18", author: "IPHF Media", pinned: false },
  { id: "n3", title: "ViperFang Suspended for 2 Games", content: "Crimson Vipers forward ViperFang has been suspended for 2 games following a dangerous play in the match against Frost Titans.", date: "2025-01-20", author: "IPHF Discipline", pinned: false },
];

export const liveMode = {
  isLive: false,
  matchId: null as string | null,
  streamUrl: "https://twitch.tv/iphf",
  currentScore: { teamA: 0, teamB: 0 },
};
