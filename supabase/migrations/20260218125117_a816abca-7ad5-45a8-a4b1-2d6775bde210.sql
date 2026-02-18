
-- Role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'league_admin', 'general_manager', 'head_coach', 'player');

-- User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  gm TEXT,
  coach TEXT,
  discord TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  position TEXT NOT NULL DEFAULT 'F',
  jersey INTEGER,
  status TEXT NOT NULL DEFAULT 'Active',
  gp INTEGER NOT NULL DEFAULT 0,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  plus_minus INTEGER NOT NULL DEFAULT 0,
  pim INTEGER NOT NULL DEFAULT 0,
  saves INTEGER,
  save_pct NUMERIC,
  gaa NUMERIC,
  shutouts INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a_id UUID REFERENCES public.teams(id),
  team_b_id UUID REFERENCES public.teams(id),
  team_a_score INTEGER,
  team_b_score INTEGER,
  match_date DATE NOT NULL,
  match_time TEXT NOT NULL DEFAULT '20:00',
  status TEXT NOT NULL DEFAULT 'Scheduled',
  season TEXT NOT NULL DEFAULT 'Season 1',
  mvp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Match goals table
CREATE TABLE public.match_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  time TEXT NOT NULL,
  team TEXT NOT NULL,
  scorer TEXT NOT NULL,
  assist TEXT DEFAULT '—'
);
ALTER TABLE public.match_goals ENABLE ROW LEVEL SECURITY;

-- News articles table
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'IPHF Admin',
  image TEXT,
  pinned BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Live mode settings table
CREATE TABLE public.live_mode (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_live BOOLEAN NOT NULL DEFAULT false,
  match_id UUID REFERENCES public.matches(id),
  stream_url TEXT DEFAULT 'https://twitch.tv/iphf',
  team_a_score INTEGER DEFAULT 0,
  team_b_score INTEGER DEFAULT 0
);
ALTER TABLE public.live_mode ENABLE ROW LEVEL SECURITY;

-- Insert default live mode row
INSERT INTO public.live_mode (id, is_live) VALUES (1, false);

-- Standings table (auto-calculated view would be ideal, but table for manual override)
CREATE TABLE public.standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL UNIQUE,
  gp INTEGER NOT NULL DEFAULT 0,
  w INTEGER NOT NULL DEFAULT 0,
  l INTEGER NOT NULL DEFAULT 0,
  ot INTEGER NOT NULL DEFAULT 0,
  pts INTEGER NOT NULL DEFAULT 0,
  gf INTEGER NOT NULL DEFAULT 0,
  ga INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;

-- Team memberships (links users to teams for GM/Coach roles)
CREATE TABLE public.team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'player',
  UNIQUE (user_id, team_id)
);
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'league_admin')
  )
$$;

-- Helper: is current user a team manager for given team?
CREATE OR REPLACE FUNCTION public.is_team_manager(_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1 FROM public.team_memberships
    WHERE user_id = auth.uid() AND team_id = _team_id AND role IN ('general_manager', 'head_coach')
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: everyone can read, users update own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles: admins manage, users read own
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.is_admin());
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Teams: public read, admins write
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Admins manage teams" ON public.teams FOR ALL USING (public.is_admin());

-- Players: public read, admins and team managers write
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Admins manage players" ON public.players FOR ALL USING (public.is_admin());
CREATE POLICY "Team managers manage own players" ON public.players FOR ALL USING (public.is_team_manager(team_id));

-- Matches: public read, admins write
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Admins manage matches" ON public.matches FOR ALL USING (public.is_admin());

-- Match goals: public read, admins write
CREATE POLICY "Anyone can view match goals" ON public.match_goals FOR SELECT USING (true);
CREATE POLICY "Admins manage match goals" ON public.match_goals FOR ALL USING (public.is_admin());

-- News: public read, admins write
CREATE POLICY "Anyone can view news" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "Admins manage news" ON public.news_articles FOR ALL USING (public.is_admin());

-- Live mode: public read, admins write
CREATE POLICY "Anyone can view live mode" ON public.live_mode FOR SELECT USING (true);
CREATE POLICY "Admins manage live mode" ON public.live_mode FOR ALL USING (public.is_admin());

-- Standings: public read, admins write
CREATE POLICY "Anyone can view standings" ON public.standings FOR SELECT USING (true);
CREATE POLICY "Admins manage standings" ON public.standings FOR ALL USING (public.is_admin());

-- Team memberships: public read, admins manage
CREATE POLICY "Anyone can view memberships" ON public.team_memberships FOR SELECT USING (true);
CREATE POLICY "Admins manage memberships" ON public.team_memberships FOR ALL USING (public.is_admin());
