CREATE TABLE public.anime_deck_cards (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 anime_key text NOT NULL CHECK (length(anime_key) BETWEEN 1 AND 100),
 title text NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
 rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
 description text NOT NULL DEFAULT '' CHECK (length(description) <= 240),
 rewatch boolean NOT NULL DEFAULT true,
 character_name text NOT NULL DEFAULT '' CHECK (length(character_name) <= 60),
 shared boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id, anime_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anime_deck_cards TO authenticated;
GRANT ALL ON public.anime_deck_cards TO service_role;
ALTER TABLE public.anime_deck_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own or shared anime cards" ON public.anime_deck_cards FOR SELECT TO authenticated USING (user_id = auth.uid() OR shared);
CREATE POLICY "Create own anime cards" ON public.anime_deck_cards FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own anime cards" ON public.anime_deck_cards FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own anime cards" ON public.anime_deck_cards FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX anime_deck_shared_key ON public.anime_deck_cards(anime_key) WHERE shared;
CREATE INDEX anime_deck_owner ON public.anime_deck_cards(user_id);