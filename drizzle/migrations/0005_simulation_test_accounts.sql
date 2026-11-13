CREATE TABLE public.sim_users (
  user_id uuid PRIMARY KEY,
  handle text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  archetype text NOT NULL,
  persona jsonb NOT NULL DEFAULT '{}'::jsonb,
  joined_day int NOT NULL DEFAULT 1,
  last_active_day int,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  relationships jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sim_users TO authenticated;
GRANT ALL ON public.sim_users TO service_role;
ALTER TABLE public.sim_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_sim_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') $$;
CREATE OR REPLACE FUNCTION public.is_test_user(uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT uid IS NOT NULL AND EXISTS(SELECT 1 FROM public.sim_users WHERE user_id = uid) $$;
GRANT EXECUTE ON FUNCTION public.is_sim_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_test_user(uuid) TO authenticated, anon;

CREATE POLICY "admins read sim users" ON public.sim_users FOR SELECT TO authenticated USING (public.is_sim_admin() OR user_id = auth.uid());

CREATE TABLE public.sim_state (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  sim_day int NOT NULL DEFAULT 0,
  paused boolean NOT NULL DEFAULT false,
  ai_budget int NOT NULL DEFAULT 3,
  ai_used int NOT NULL DEFAULT 0,
  epoch date NOT NULL DEFAULT DATE '2026-10-01',
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.sim_state (id) VALUES (1) ON CONFLICT DO NOTHING;
GRANT SELECT ON public.sim_state TO authenticated;
GRANT ALL ON public.sim_state TO service_role;
ALTER TABLE public.sim_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read sim state" ON public.sim_state FOR SELECT TO authenticated USING (public.is_sim_admin());

CREATE TABLE public.sim_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sim_day int NOT NULL,
  seq int NOT NULL,
  sim_at timestamptz NOT NULL,
  kind text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  ok boolean NOT NULL DEFAULT true,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sim_day, seq)
);
CREATE INDEX sim_events_day_idx ON public.sim_events (sim_day);
CREATE INDEX sim_events_user_idx ON public.sim_events (user_id, sim_at);
GRANT SELECT ON public.sim_events TO authenticated;
GRANT ALL ON public.sim_events TO service_role;
ALTER TABLE public.sim_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read sim events" ON public.sim_events FOR SELECT TO authenticated USING (public.is_sim_admin());

CREATE TABLE public.sim_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sim_day int NOT NULL,
  started_at timestamptz NOT NULL,
  duration_s int NOT NULL,
  actions int NOT NULL DEFAULT 0,
  UNIQUE (user_id, sim_day)
);
GRANT SELECT ON public.sim_sessions TO authenticated;
GRANT ALL ON public.sim_sessions TO service_role;
ALTER TABLE public.sim_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read sim sessions" ON public.sim_sessions FOR SELECT TO authenticated USING (public.is_sim_admin());

CREATE TABLE public.sim_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL,
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('passed','failed','skipped','unimplemented')),
  detail text NOT NULL DEFAULT '',
  sim_day int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (area, name)
);
GRANT SELECT ON public.sim_test_results TO authenticated;
GRANT ALL ON public.sim_test_results TO service_role;
ALTER TABLE public.sim_test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read sim tests" ON public.sim_test_results FOR SELECT TO authenticated USING (public.is_sim_admin());

-- Mark synthetic community content server-side so clients cannot spoof it.
ALTER TABLE public.posts ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.comments ADD COLUMN is_test boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION public.mark_test_content() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$ BEGIN NEW.is_test := public.is_test_user(NEW.author_id); RETURN NEW; END $$;
CREATE TRIGGER posts_mark_test BEFORE INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.mark_test_content();
CREATE TRIGGER comments_mark_test BEFORE INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.mark_test_content();

-- Synthetic activity is visible only to the test account itself and admins.
CREATE POLICY "hide test posts" ON public.posts AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (NOT is_test OR author_id = auth.uid() OR public.is_sim_admin());
CREATE POLICY "hide test comments" ON public.comments AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (NOT is_test OR author_id = auth.uid() OR public.is_sim_admin());
CREATE POLICY "hide test likes" ON public.post_likes AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (NOT public.is_test_user(user_id) OR user_id = auth.uid() OR public.is_sim_admin());
CREATE POLICY "hide test votes" ON public.poll_votes AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (NOT public.is_test_user(user_id) OR user_id = auth.uid() OR public.is_sim_admin());
CREATE POLICY "hide test profiles" ON public.profiles AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (NOT public.is_test_user(id) OR id = auth.uid() OR public.is_sim_admin());
CREATE POLICY "hide test anime cards" ON public.anime_deck_cards AS RESTRICTIVE FOR SELECT TO authenticated USING (NOT public.is_test_user(user_id) OR user_id = auth.uid() OR public.is_sim_admin() OR public.is_test_user(auth.uid()));
CREATE POLICY "admins read test chats" ON public.chat_messages FOR SELECT TO authenticated USING (public.is_sim_admin() AND public.is_test_user(user_id));