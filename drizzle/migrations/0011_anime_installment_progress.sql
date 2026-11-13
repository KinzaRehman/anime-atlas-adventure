CREATE TABLE public.anime_installment_progress (
 user_id uuid NOT NULL DEFAULT auth.uid(),
 installment_id integer NOT NULL,
 franchise_id integer NOT NULL,
 status text NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started','Watching','Completed','On Hold','Dropped')),
 episodes_watched integer NOT NULL DEFAULT 0 CHECK (episodes_watched >= 0),
 completed_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id, installment_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anime_installment_progress TO authenticated;
GRANT ALL ON public.anime_installment_progress TO service_role;
ALTER TABLE public.anime_installment_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own anime progress" ON public.anime_installment_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TABLE public.anime_franchise_favorites (
 user_id uuid NOT NULL DEFAULT auth.uid(),
 franchise_id integer NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id, franchise_id)
);
GRANT SELECT, INSERT, DELETE ON public.anime_franchise_favorites TO authenticated;
GRANT ALL ON public.anime_franchise_favorites TO service_role;
ALTER TABLE public.anime_franchise_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own anime favorites" ON public.anime_franchise_favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX anime_progress_franchise_idx ON public.anime_installment_progress(user_id, franchise_id);