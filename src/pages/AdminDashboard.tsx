import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, Trophy, Newspaper, Radio, UserPlus, LogOut, Trash2, Pencil, Upload, Layers, GitBranch } from "lucide-react";

// ─── Hooks ───
const useTeams = () => useQuery({
  queryKey: ["admin-teams"],
  queryFn: async () => {
    const { data, error } = await supabase.from("teams").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

const usePlayers = () => useQuery({
  queryKey: ["admin-players"],
  queryFn: async () => {
    const { data, error } = await supabase.from("players").select("*, teams(name)").order("name");
    if (error) throw error;
    return data;
  },
});

const useMatches = () => useQuery({
  queryKey: ["admin-matches"],
  queryFn: async () => {
    const { data, error } = await supabase.from("matches").select("*, team_a:teams!team_a_id(name), team_b:teams!team_b_id(name)").order("match_date", { ascending: false });
    if (error) throw error;
    return data;
  },
});

const useNews = () => useQuery({
  queryKey: ["admin-news"],
  queryFn: async () => {
    const { data, error } = await supabase.from("news_articles").select("*").order("published_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

const useLiveMode = () => useQuery({
  queryKey: ["admin-live"],
  queryFn: async () => {
    const { data, error } = await supabase.from("live_mode").select("*").eq("id", 1).single();
    if (error) throw error;
    return data;
  },
});

const useStandings = () => useQuery({
  queryKey: ["admin-standings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("standings").select("*, teams(name, abbreviation)").order("pts", { ascending: false });
    if (error) throw error;
    return data;
  },
});

const useGroups = () => useQuery({
  queryKey: ["admin-groups"],
  queryFn: async () => {
    const { data, error } = await (supabase as any)
      .from("groups")
      .select("*, group_teams(id, team_id, teams(id, name))")
      .order("name");
    if (error) throw error;
    return data as any[];
  },
});

const usePlayoffs = () => useQuery({
  queryKey: ["admin-playoffs"],
  queryFn: async () => {
    const { data, error } = await (supabase as any)
      .from("playoffs")
      .select("*, team_a:teams!team_a_id(id, name), team_b:teams!team_b_id(id, name), winner:teams!winner_id(id, name)")
      .order("round")
      .order("bracket_position");
    if (error) throw error;
    return data as any[];
  },
});

const useUsers = () => useQuery({
  queryKey: ["admin-users"],
  queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("*, user_roles(role)");
    if (error) throw error;
    return data;
  },
});

// ─── Team Management ───
const TeamPanel = () => {
  const { data: teams, isLoading } = useTeams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", abbreviation: "", color: "#3b82f6", gm: "", coach: "", discord: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadLogo = async (teamId: string): Promise<string | null> => {
    if (!logoFile) return null;
    const ext = logoFile.name.split('.').pop();
    const path = `${teamId}.${ext}`;
    const { error } = await supabase.storage.from("team-logos").upload(path, logoFile, { upsert: true });
    if (error) { toast({ title: "Logo upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data } = supabase.storage.from("team-logos").getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async () => {
    if (!form.name || !form.abbreviation) return;
    setUploading(true);
    let error;
    if (editId) {
      const logoUrl = await uploadLogo(editId);
      const payload: any = { ...form };
      if (logoUrl) payload.logo_url = logoUrl;
      ({ error } = await supabase.from("teams").update(payload).eq("id", editId));
    } else {
      const { data: inserted, error: insErr } = await supabase.from("teams").insert(form as any).select().single();
      error = insErr;
      if (inserted && logoFile) {
        const logoUrl = await uploadLogo(inserted.id);
        if (logoUrl) await supabase.from("teams").update({ logo_url: logoUrl }).eq("id", inserted.id);
      }
    }
    setUploading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editId ? "Team updated" : "Team created" });
    setForm({ name: "", abbreviation: "", color: "#3b82f6", gm: "", coach: "", discord: "" });
    setLogoFile(null);
    setEditId(null);
    qc.invalidateQueries({ queryKey: ["admin-teams"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Team deleted" });
    qc.invalidateQueries({ queryKey: ["admin-teams"] });
  };

  const edit = (t: any) => {
    setEditId(t.id);
    setForm({ name: t.name, abbreviation: t.abbreviation, color: t.color, gm: t.gm || "", coach: t.coach || "", discord: t.discord || "" });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle className="text-lg">{editId ? "Edit Team" : "Add Team"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Team Name (e.g. Czech Republic)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Abbreviation (e.g. CZE)" value={form.abbreviation} onChange={e => setForm({ ...form, abbreviation: e.target.value })} />
            <Input placeholder="Color (#hex)" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
            <Input placeholder="Discord" value={form.discord} onChange={e => setForm({ ...form, discord: e.target.value })} />
            <Input placeholder="GM Name" value={form.gm} onChange={e => setForm({ ...form, gm: e.target.value })} />
            <Input placeholder="Coach Name" value={form.coach} onChange={e => setForm({ ...form, coach: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Team Logo (flag / crest image)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border border-border bg-secondary/50 hover:bg-secondary text-sm transition-colors">
                <Upload className="h-4 w-4" />
                {logoFile ? logoFile.name : "Choose logo file"}
                <input type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
              </label>
              {logoFile && <span className="text-xs text-muted-foreground">Ready to upload</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={uploading}>{uploading ? "Saving..." : editId ? "Update" : "Create"}</Button>
            {editId && <Button variant="ghost" onClick={() => { setEditId(null); setForm({ name: "", abbreviation: "", color: "#3b82f6", gm: "", coach: "", discord: "" }); setLogoFile(null); }}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Logo</TableHead><TableHead>Name</TableHead><TableHead>ABV</TableHead><TableHead>GM</TableHead><TableHead>Coach</TableHead><TableHead className="w-24">Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {isLoading ? <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow> :
            teams?.map(t => (
              <TableRow key={t.id}>
                <TableCell>
                  {(t as any).logo_url ? (
                    <img src={(t as any).logo_url} alt={t.name} className="w-8 h-8 object-contain rounded" />
                  ) : (
                    <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: t.color + "30", color: t.color }}>{t.abbreviation}</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.abbreviation}</TableCell>
                <TableCell>{t.gm}</TableCell>
                <TableCell>{t.coach}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => edit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ─── Player Management ───
const PlayerPanel = () => {
  const { data: players, isLoading } = usePlayers();
  const { data: teams } = useTeams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", team_id: "", position: "F", jersey: "", status: "Active",
    gp: "0", goals: "0", assists: "0", plus_minus: "0", pim: "0",
    saves: "", shots_against: "", gaa: "", shutouts: "",
  });
  const [editId, setEditId] = useState<string | null>(null);

  const autoPoints = parseInt(form.goals || "0") + parseInt(form.assists || "0");
  const savesNum = parseInt(form.saves || "0");
  const shotsNum = parseInt(form.shots_against || "0");
  const autoSavePct = shotsNum > 0 ? (savesNum / shotsNum) : null;

  const save = async () => {
    if (!form.name) return;
    const isGoalie = form.position === "G";
    const payload: any = {
      name: form.name, team_id: form.team_id || null, position: form.position,
      jersey: form.jersey ? parseInt(form.jersey) : null, status: form.status,
      gp: parseInt(form.gp), goals: parseInt(form.goals), assists: parseInt(form.assists),
      points: autoPoints, plus_minus: parseInt(form.plus_minus), pim: parseInt(form.pim),
      saves: isGoalie && form.saves ? savesNum : null,
      shots_against: isGoalie && form.shots_against ? shotsNum : null,
      save_pct: isGoalie ? autoSavePct : null,
      gaa: isGoalie && form.gaa ? parseFloat(form.gaa) : null,
      shutouts: isGoalie && form.shutouts ? parseInt(form.shutouts) : null,
    };
    let error;
    if (editId) {
      ({ error } = await supabase.from("players").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("players").insert(payload));
    }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editId ? "Player updated" : "Player created" });
    setForm({ name: "", team_id: "", position: "F", jersey: "", status: "Active", gp: "0", goals: "0", assists: "0", plus_minus: "0", pim: "0", saves: "", shots_against: "", gaa: "", shutouts: "" });
    setEditId(null);
    qc.invalidateQueries({ queryKey: ["admin-players"] });
  };

  const remove = async (id: string) => {
    await supabase.from("players").delete().eq("id", id);
    toast({ title: "Player deleted" });
    qc.invalidateQueries({ queryKey: ["admin-players"] });
  };

  const startEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      name: p.name, team_id: p.team_id || "", position: p.position,
      jersey: p.jersey?.toString() || "", status: p.status,
      gp: p.gp.toString(), goals: p.goals.toString(), assists: p.assists.toString(),
      plus_minus: p.plus_minus.toString(), pim: p.pim.toString(),
      saves: p.saves?.toString() || "", shots_against: (p as any).shots_against?.toString() || "",
      gaa: p.gaa?.toString() || "", shutouts: p.shutouts?.toString() || "",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle className="text-lg">{editId ? "Edit Player" : "Add Player"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Input placeholder="Player Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Select value={form.team_id} onValueChange={v => setForm({ ...form, team_id: v })}>
              <SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger>
              <SelectContent>{teams?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.position} onValueChange={v => setForm({ ...form, position: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="F">Forward</SelectItem>
                <SelectItem value="D">Defense</SelectItem>
                <SelectItem value="G">Goalie</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Jersey #" value={form.jersey} onChange={e => setForm({ ...form, jersey: e.target.value })} />
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Injured">Injured</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="GP" value={form.gp} onChange={e => setForm({ ...form, gp: e.target.value })} />
            <Input placeholder="Goals" value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} />
            <Input placeholder="Assists" value={form.assists} onChange={e => setForm({ ...form, assists: e.target.value })} />
            <div className="flex items-center gap-2 bg-secondary/50 rounded px-3 py-2">
              <span className="text-xs text-muted-foreground">Points (auto):</span>
              <span className="font-bold text-primary">{autoPoints}</span>
            </div>
            <Input placeholder="+/-" value={form.plus_minus} onChange={e => setForm({ ...form, plus_minus: e.target.value })} />
            <Input placeholder="PIM" value={form.pim} onChange={e => setForm({ ...form, pim: e.target.value })} />
          </div>
          {form.position === "G" && (
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Goalie Stats</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input placeholder="Saves" value={form.saves} onChange={e => setForm({ ...form, saves: e.target.value })} />
                <Input placeholder="Shots Against" value={form.shots_against} onChange={e => setForm({ ...form, shots_against: e.target.value })} />
                <div className="flex items-center gap-2 bg-secondary/50 rounded px-3 py-2">
                  <span className="text-xs text-muted-foreground">SV% (auto):</span>
                  <span className="font-bold text-accent">{autoSavePct !== null ? (autoSavePct * 100).toFixed(1) + "%" : "—"}</span>
                </div>
                <Input placeholder="GAA" value={form.gaa} onChange={e => setForm({ ...form, gaa: e.target.value })} />
                <Input placeholder="Shutouts" value={form.shutouts} onChange={e => setForm({ ...form, shutouts: e.target.value })} />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={save}>{editId ? "Update" : "Create"}</Button>
            {editId && <Button variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Name</TableHead><TableHead>Team</TableHead><TableHead>Pos</TableHead><TableHead>GP</TableHead><TableHead>G</TableHead><TableHead>A</TableHead><TableHead>P</TableHead><TableHead>SV%</TableHead><TableHead className="w-24">Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {isLoading ? <TableRow><TableCell colSpan={9}>Loading...</TableCell></TableRow> :
            players?.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.teams?.name || "—"}</TableCell>
                <TableCell>{p.position}</TableCell>
                <TableCell>{p.gp}</TableCell>
                <TableCell>{p.goals}</TableCell>
                <TableCell>{p.assists}</TableCell>
                <TableCell className="font-bold text-primary">{p.points}</TableCell>
                <TableCell>{p.position === "G" && p.save_pct != null ? (Number(p.save_pct) * 100).toFixed(1) + "%" : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ─── Match Management ───
const MatchPanel = () => {
  const { data: matchList, isLoading } = useMatches();
  const { data: teams } = useTeams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    team_a_id: "", team_b_id: "", match_date: "", match_time: "20:00",
    status: "Scheduled", season: "Season 1", result_type: "REG",
    team_a_score: "", team_b_score: "", mvp: "",
  });
  const [editId, setEditId] = useState<string | null>(null);

  const save = async () => {
    if (!form.team_a_id || !form.team_b_id || !form.match_date) return;
    const payload = {
      team_a_id: form.team_a_id, team_b_id: form.team_b_id, match_date: form.match_date,
      match_time: form.match_time, status: form.status, season: form.season,
      result_type: form.result_type,
      team_a_score: form.team_a_score ? parseInt(form.team_a_score) : null,
      team_b_score: form.team_b_score ? parseInt(form.team_b_score) : null,
      mvp: form.mvp || null,
    };
    let error;
    if (editId) {
      ({ error } = await supabase.from("matches").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("matches").insert(payload));
    }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editId ? "Match updated" : "Match created" });
    setForm({ team_a_id: "", team_b_id: "", match_date: "", match_time: "20:00", status: "Scheduled", season: "Season 1", result_type: "REG", team_a_score: "", team_b_score: "", mvp: "" });
    setEditId(null);
    qc.invalidateQueries({ queryKey: ["admin-matches"] });
  };

  const remove = async (id: string) => {
    await supabase.from("matches").delete().eq("id", id);
    toast({ title: "Match deleted" });
    qc.invalidateQueries({ queryKey: ["admin-matches"] });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle className="text-lg">{editId ? "Edit Match" : "Schedule Match"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Select value={form.team_a_id} onValueChange={v => setForm({ ...form, team_a_id: v })}>
              <SelectTrigger><SelectValue placeholder="Team A" /></SelectTrigger>
              <SelectContent>{teams?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.team_b_id} onValueChange={v => setForm({ ...form, team_b_id: v })}>
              <SelectTrigger><SelectValue placeholder="Team B" /></SelectTrigger>
              <SelectContent>{teams?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="date" value={form.match_date} onChange={e => setForm({ ...form, match_date: e.target.value })} />
            <Input placeholder="Time (HH:MM)" value={form.match_time} onChange={e => setForm({ ...form, match_time: e.target.value })} />
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Live">Live</SelectItem>
                <SelectItem value="Finished">Finished</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.result_type} onValueChange={v => setForm({ ...form, result_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="REG">Regular Time (REG)</SelectItem>
                <SelectItem value="OT">Overtime (OT)</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Season" value={form.season} onChange={e => setForm({ ...form, season: e.target.value })} />
            <Input placeholder="Team A Score" value={form.team_a_score} onChange={e => setForm({ ...form, team_a_score: e.target.value })} />
            <Input placeholder="Team B Score" value={form.team_b_score} onChange={e => setForm({ ...form, team_b_score: e.target.value })} />
            <Input placeholder="MVP" value={form.mvp} onChange={e => setForm({ ...form, mvp: e.target.value })} />
          </div>
          {form.result_type === "OT" && (
            <p className="text-xs text-accent">ℹ️ OT result: winner gets 2 pts, loser gets 1 pt (OTL). Update standings accordingly.</p>
          )}
          <div className="flex gap-2">
            <Button onClick={save}>{editId ? "Update" : "Create"}</Button>
            {editId && <Button variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Team A</TableHead><TableHead>Team B</TableHead><TableHead>Date</TableHead><TableHead>Score</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="w-24">Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {isLoading ? <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow> :
            matchList?.map((m: any) => (
              <TableRow key={m.id}>
                <TableCell>{m.team_a?.name}</TableCell>
                <TableCell>{m.team_b?.name}</TableCell>
                <TableCell>{m.match_date}</TableCell>
                <TableCell>{m.team_a_score != null ? `${m.team_a_score} – ${m.team_b_score}` : "—"}</TableCell>
                <TableCell><span className={`text-xs px-1.5 py-0.5 rounded ${(m as any).result_type === "OT" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>{(m as any).result_type || "REG"}</span></TableCell>
                <TableCell><span className={`text-xs px-2 py-1 rounded ${m.status === "Live" ? "bg-green-500/20 text-green-400" : m.status === "Finished" ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary"}`}>{m.status}</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => {
                      setEditId(m.id);
                      setForm({ team_a_id: m.team_a_id, team_b_id: m.team_b_id, match_date: m.match_date, match_time: m.match_time, status: m.status, season: m.season, result_type: (m as any).result_type || "REG", team_a_score: m.team_a_score?.toString() || "", team_b_score: m.team_b_score?.toString() || "", mvp: m.mvp || "" });
                    }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ─── News Management ───
const NewsPanel = () => {
  const { data: articles, isLoading } = useNews();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", content: "", author: "IPHF Admin", image: "", pinned: false });
  const [editId, setEditId] = useState<string | null>(null);

  const save = async () => {
    if (!form.title || !form.content) return;
    const payload = { title: form.title, content: form.content, author: form.author, image: form.image || null, pinned: form.pinned };
    let error;
    if (editId) {
      ({ error } = await supabase.from("news_articles").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("news_articles").insert(payload));
    }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editId ? "Article updated" : "Article published" });
    setForm({ title: "", content: "", author: "IPHF Admin", image: "", pinned: false });
    setEditId(null);
    qc.invalidateQueries({ queryKey: ["admin-news"] });
  };

  const remove = async (id: string) => {
    await supabase.from("news_articles").delete().eq("id", id);
    toast({ title: "Article deleted" });
    qc.invalidateQueries({ queryKey: ["admin-news"] });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle className="text-lg">{editId ? "Edit Article" : "Publish Article"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="min-h-[120px]" />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
            <Input placeholder="Image URL (optional)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.pinned} onCheckedChange={v => setForm({ ...form, pinned: v })} />
            <span className="text-sm text-muted-foreground">Pinned</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>{editId ? "Update" : "Publish"}</Button>
            {editId && <Button variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>Date</TableHead><TableHead>Pinned</TableHead><TableHead className="w-24">Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {isLoading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> :
            articles?.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell>{a.author}</TableCell>
                <TableCell>{new Date(a.published_at).toLocaleDateString()}</TableCell>
                <TableCell>{a.pinned ? "📌" : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => {
                      setEditId(a.id);
                      setForm({ title: a.title, content: a.content, author: a.author, image: a.image || "", pinned: a.pinned });
                    }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ─── Groups Management ───
const GroupsPanel = () => {
  const { data: groups, isLoading } = useGroups();
  const { data: teams } = useTeams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [groupName, setGroupName] = useState("");
  const [season, setSeason] = useState("Season 1");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState("");

  const createGroup = async () => {
    if (!groupName) return;
    const { error } = await (supabase as any).from("groups").insert({ name: groupName, season });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Group "${groupName}" created` });
    setGroupName("");
    qc.invalidateQueries({ queryKey: ["admin-groups"] });
  };

  const deleteGroup = async (id: string) => {
    const { error } = await (supabase as any).from("groups").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Group deleted" });
    qc.invalidateQueries({ queryKey: ["admin-groups"] });
  };

  const addTeamToGroup = async () => {
    if (!selectedGroup || !selectedTeam) return;
    const { error } = await (supabase as any).from("group_teams").insert({ group_id: selectedGroup, team_id: selectedTeam });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Team added to group" });
    setSelectedTeam("");
    qc.invalidateQueries({ queryKey: ["admin-groups"] });
  };

  const removeTeamFromGroup = async (id: string) => {
    await (supabase as any).from("group_teams").delete().eq("id", id);
    toast({ title: "Team removed" });
    qc.invalidateQueries({ queryKey: ["admin-groups"] });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5" /> Create Group</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Group Name (e.g. Group A)" value={groupName} onChange={e => setGroupName(e.target.value)} />
            <Input placeholder="Season" value={season} onChange={e => setSeason(e.target.value)} />
          </div>
          <Button onClick={createGroup}>Create Group</Button>
        </CardContent>
      </Card>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : groups?.map((g: any) => (
        <Card key={g.id} className="bg-gradient-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-2 h-5 rounded bg-primary inline-block" />
                {g.name} <span className="text-xs text-muted-foreground font-normal ml-1">({g.season})</span>
              </CardTitle>
              <Button size="icon" variant="ghost" onClick={() => deleteGroup(g.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-8">
              {(g.group_teams || []).map((gt: any) => (
                <span key={gt.id} className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-secondary border border-border">
                  {gt.teams?.name}
                  <button onClick={() => removeTeamFromGroup(gt.id)} className="ml-1 text-muted-foreground hover:text-destructive transition-colors">×</button>
                </span>
              ))}
              {(g.group_teams || []).length === 0 && <span className="text-xs text-muted-foreground">No teams yet</span>}
            </div>
            <div className="flex gap-2">
              <Select value={selectedGroup === g.id ? selectedTeam : ""} onValueChange={v => { setSelectedGroup(g.id); setSelectedTeam(v); }}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Add team…" /></SelectTrigger>
                <SelectContent>
                  {teams?.filter(t => !(g.group_teams || []).find((gt: any) => gt.team_id === t.id))
                    .map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => { setSelectedGroup(g.id); addTeamToGroup(); }} disabled={selectedGroup !== g.id || !selectedTeam}>Add</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ─── Playoffs Management ───
const PlayoffsPanel = () => {
  const { data: playoffData, isLoading } = usePlayoffs();
  const { data: teams } = useTeams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: matchList } = useMatches();
  const [form, setForm] = useState({
    season: "Season 1", round: "Quarter-Final", bracket_position: "1",
    team_a_id: "", team_b_id: "", winner_id: "", match_id: "",
  });
  const [editId, setEditId] = useState<string | null>(null);

  const save = async () => {
    if (!form.round) return;
    const payload: any = {
      season: form.season, round: form.round, bracket_position: parseInt(form.bracket_position),
      team_a_id: form.team_a_id || null, team_b_id: form.team_b_id || null,
      winner_id: form.winner_id || null, match_id: form.match_id || null,
    };
    let error;
    if (editId) {
      ({ error } = await (supabase as any).from("playoffs").update(payload).eq("id", editId));
    } else {
      ({ error } = await (supabase as any).from("playoffs").insert(payload));
    }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editId ? "Matchup updated" : "Matchup added" });
    setForm({ season: "Season 1", round: "Quarter-Final", bracket_position: "1", team_a_id: "", team_b_id: "", winner_id: "", match_id: "" });
    setEditId(null);
    qc.invalidateQueries({ queryKey: ["admin-playoffs"] });
  };

  const remove = async (id: string) => {
    await (supabase as any).from("playoffs").delete().eq("id", id);
    toast({ title: "Matchup removed" });
    qc.invalidateQueries({ queryKey: ["admin-playoffs"] });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GitBranch className="h-5 w-5" /> {editId ? "Edit Playoff Matchup" : "Add Playoff Matchup"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Input placeholder="Season" value={form.season} onChange={e => setForm({ ...form, season: e.target.value })} />
            <Select value={form.round} onValueChange={v => setForm({ ...form, round: v })}>
              <SelectTrigger><SelectValue placeholder="Round" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Quarter-Final">Quarter-Final</SelectItem>
                <SelectItem value="Semi-Final">Semi-Final</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Position in bracket (1,2,3…)" value={form.bracket_position} onChange={e => setForm({ ...form, bracket_position: e.target.value })} />
            <Select value={form.team_a_id} onValueChange={v => setForm({ ...form, team_a_id: v })}>
              <SelectTrigger><SelectValue placeholder="Team A" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">TBD</SelectItem>
                {teams?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.team_b_id} onValueChange={v => setForm({ ...form, team_b_id: v })}>
              <SelectTrigger><SelectValue placeholder="Team B" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">TBD</SelectItem>
                {teams?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.winner_id} onValueChange={v => setForm({ ...form, winner_id: v })}>
              <SelectTrigger><SelectValue placeholder="Winner (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">No winner yet</SelectItem>
                {teams?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.match_id} onValueChange={v => setForm({ ...form, match_id: v })}>
              <SelectTrigger><SelectValue placeholder="Link a match (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">No match linked</SelectItem>
                {matchList?.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.team_a?.name} vs {m.team_b?.name} ({m.match_date})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>{editId ? "Update" : "Add Matchup"}</Button>
            {editId && <Button variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Round</TableHead><TableHead>Pos</TableHead><TableHead>Team A</TableHead><TableHead>Team B</TableHead><TableHead>Winner</TableHead><TableHead className="w-24">Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {isLoading ? <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow> :
            playoffData?.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.round}</TableCell>
                <TableCell>{p.bracket_position}</TableCell>
                <TableCell>{p.team_a?.name || "TBD"}</TableCell>
                <TableCell>{p.team_b?.name || "TBD"}</TableCell>
                <TableCell className="text-primary font-bold">{p.winner?.name || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => {
                      setEditId(p.id);
                      setForm({ season: p.season, round: p.round, bracket_position: p.bracket_position.toString(), team_a_id: p.team_a_id || "", team_b_id: p.team_b_id || "", winner_id: p.winner_id || "", match_id: p.match_id || "" });
                    }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ─── Live Mode Control ───
const LivePanel = () => {
  const { data: live, isLoading } = useLiveMode();
  const { data: matchList } = useMatches();
  const qc = useQueryClient();
  const { toast } = useToast();

  const update = async (fields: any) => {
    const { error } = await supabase.from("live_mode").update(fields).eq("id", 1);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Live mode updated" });
    qc.invalidateQueries({ queryKey: ["admin-live"] });
  };

  if (isLoading || !live) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Radio className="h-5 w-5" /> Live Control Panel</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={live.is_live} onCheckedChange={v => update({ is_live: v })} />
            <span className={`font-bold ${live.is_live ? "text-green-400" : "text-muted-foreground"}`}>{live.is_live ? "🔴 LIVE NOW" : "OFFLINE"}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={live.match_id || ""} onValueChange={v => update({ match_id: v || null })}>
              <SelectTrigger><SelectValue placeholder="Select Match" /></SelectTrigger>
              <SelectContent>{matchList?.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.team_a?.name} vs {m.team_b?.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Stream URL" defaultValue={live.stream_url || ""} onBlur={e => update({ stream_url: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Team A Score</label>
              <Input type="number" defaultValue={live.team_a_score || 0} onBlur={e => update({ team_a_score: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Team B Score</label>
              <Input type="number" defaultValue={live.team_b_score || 0} onBlur={e => update({ team_b_score: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Standings Management ───
const StandingsPanel = () => {
  const { data: standings, isLoading } = useStandings();
  const { data: teams } = useTeams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ team_id: "", gp: "0", w: "0", otw: "0", l: "0", ot: "0", pts: "0", gf: "0", ga: "0" });
  const [editId, setEditId] = useState<string | null>(null);

  // Auto-calc pts: W*2 + OTW*2 + OTL*1
  const autoPts = parseInt(form.w || "0") * 2 + parseInt(form.otw || "0") * 2 + parseInt(form.ot || "0") * 1;

  const save = async () => {
    if (!form.team_id) return;
    const payload: any = {
      team_id: form.team_id, gp: parseInt(form.gp), w: parseInt(form.w), otw: parseInt(form.otw),
      l: parseInt(form.l), ot: parseInt(form.ot), pts: autoPts,
      gf: parseInt(form.gf), ga: parseInt(form.ga),
    };
    let error;
    if (editId) {
      ({ error } = await supabase.from("standings").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("standings").upsert(payload, { onConflict: "team_id" }));
    }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Standings updated" });
    setForm({ team_id: "", gp: "0", w: "0", otw: "0", l: "0", ot: "0", pts: "0", gf: "0", ga: "0" });
    setEditId(null);
    qc.invalidateQueries({ queryKey: ["admin-standings"] });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle className="text-lg">{editId ? "Edit Standings" : "Update Standings"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Points auto-calculated: W×2 + OTW×2 + OTL×1</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={form.team_id} onValueChange={v => setForm({ ...form, team_id: v })}>
              <SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger>
              <SelectContent>{teams?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="GP" value={form.gp} onChange={e => setForm({ ...form, gp: e.target.value })} />
            <Input placeholder="W (reg wins)" value={form.w} onChange={e => setForm({ ...form, w: e.target.value })} />
            <Input placeholder="OTW (overtime wins)" value={form.otw} onChange={e => setForm({ ...form, otw: e.target.value })} />
            <Input placeholder="L (reg losses)" value={form.l} onChange={e => setForm({ ...form, l: e.target.value })} />
            <Input placeholder="OTL (overtime losses)" value={form.ot} onChange={e => setForm({ ...form, ot: e.target.value })} />
            <div className="flex items-center gap-2 bg-secondary/50 rounded px-3 py-2">
              <span className="text-xs text-muted-foreground">PTS (auto):</span>
              <span className="font-bold text-primary">{autoPts}</span>
            </div>
            <Input placeholder="GF" value={form.gf} onChange={e => setForm({ ...form, gf: e.target.value })} />
            <Input placeholder="GA" value={form.ga} onChange={e => setForm({ ...form, ga: e.target.value })} />
          </div>
          <Button onClick={save}>{editId ? "Update" : "Save"}</Button>
        </CardContent>
      </Card>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Team</TableHead><TableHead>GP</TableHead><TableHead>W</TableHead><TableHead>OTW</TableHead><TableHead>L</TableHead><TableHead>OTL</TableHead><TableHead>PTS</TableHead><TableHead>GF</TableHead><TableHead>GA</TableHead><TableHead className="w-16">Edit</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {isLoading ? <TableRow><TableCell colSpan={10}>Loading...</TableCell></TableRow> :
            standings?.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.teams?.name}</TableCell>
                <TableCell>{s.gp}</TableCell><TableCell>{s.w}</TableCell><TableCell className="text-accent">{s.otw ?? 0}</TableCell><TableCell>{s.l}</TableCell><TableCell>{s.ot}</TableCell>
                <TableCell className="font-bold text-primary">{s.pts}</TableCell><TableCell>{s.gf}</TableCell><TableCell>{s.ga}</TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => {
                    setEditId(s.id);
                    setForm({ team_id: s.team_id, gp: s.gp.toString(), w: s.w.toString(), otw: (s.otw ?? 0).toString(), l: s.l.toString(), ot: s.ot.toString(), pts: s.pts.toString(), gf: s.gf.toString(), ga: s.ga.toString() });
                  }}><Pencil className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ─── User Management ───
const UserPanel = () => {
  const { data: users, isLoading } = useUsers();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", password: "", display_name: "", role: "player" as string });

  const createUser = async () => {
    if (!form.email || !form.password || !form.role) return;
    try {
      const res = await supabase.functions.invoke("admin-create-user", {
        body: { email: form.email, password: form.password, display_name: form.display_name, role: form.role },
      });
      if (res.error) throw res.error;
      if (res.data?.error) { toast({ title: "Error", description: res.data.error, variant: "destructive" }); return; }
      toast({ title: "User created", description: `${form.email} with role ${form.role}` });
      setForm({ email: "", password: "", display_name: "", role: "player" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><UserPlus className="h-5 w-5" /> Create User</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <Input placeholder="Display Name" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} />
            <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="league_admin">League Admin</SelectItem>
                <SelectItem value="general_manager">General Manager</SelectItem>
                <SelectItem value="head_coach">Head Coach</SelectItem>
                <SelectItem value="player">Player</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={createUser}><UserPlus className="h-4 w-4 mr-2" /> Create User</Button>
        </CardContent>
      </Card>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Name</TableHead><TableHead>Roles</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {isLoading ? <TableRow><TableCell colSpan={2}>Loading...</TableCell></TableRow> :
            users?.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.display_name}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {u.user_roles?.map((r: any, i: number) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{r.role}</span>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ─── Main Dashboard ───
const AdminDashboard = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" /> Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage all IPHF content and settings</p>
        </div>
        <Button variant="ghost" onClick={signOut} className="gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <Tabs defaultValue="teams">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="teams" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Teams</TabsTrigger>
          <TabsTrigger value="players" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Players</TabsTrigger>
          <TabsTrigger value="matches" className="gap-1.5"><Trophy className="h-3.5 w-3.5" /> Matches</TabsTrigger>
          <TabsTrigger value="standings" className="gap-1.5"><Trophy className="h-3.5 w-3.5" /> Standings</TabsTrigger>
          <TabsTrigger value="groups" className="gap-1.5"><Layers className="h-3.5 w-3.5" /> Groups</TabsTrigger>
          <TabsTrigger value="playoffs" className="gap-1.5"><GitBranch className="h-3.5 w-3.5" /> Playoffs</TabsTrigger>
          <TabsTrigger value="news" className="gap-1.5"><Newspaper className="h-3.5 w-3.5" /> News</TabsTrigger>
          <TabsTrigger value="live" className="gap-1.5"><Radio className="h-3.5 w-3.5" /> Live</TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5"><UserPlus className="h-3.5 w-3.5" /> Users</TabsTrigger>
        </TabsList>

        <TabsContent value="teams"><TeamPanel /></TabsContent>
        <TabsContent value="players"><PlayerPanel /></TabsContent>
        <TabsContent value="matches"><MatchPanel /></TabsContent>
        <TabsContent value="standings"><StandingsPanel /></TabsContent>
        <TabsContent value="groups"><GroupsPanel /></TabsContent>
        <TabsContent value="playoffs"><PlayoffsPanel /></TabsContent>
        <TabsContent value="news"><NewsPanel /></TabsContent>
        <TabsContent value="live"><LivePanel /></TabsContent>
        <TabsContent value="users"><UserPanel /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
