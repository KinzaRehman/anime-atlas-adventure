CREATE OR REPLACE FUNCTION public.is_community_hidden(_kind text, _id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.community_hidden WHERE target_kind = _kind AND target_id = _id)
$$;

CREATE OR REPLACE FUNCTION public.is_public_profile(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.posts WHERE author_id = _uid)
      OR EXISTS (SELECT 1 FROM public.comments WHERE author_id = _uid)
      OR EXISTS (SELECT 1 FROM public.anime_deck_cards WHERE user_id = _uid AND shared)
$$;

CREATE OR REPLACE FUNCTION public.poll_vote_counts(_poll_id uuid)
RETURNS TABLE(option_index integer, votes bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.option_index, count(*)::bigint FROM public.poll_votes v
  WHERE v.poll_id = _poll_id
    AND (NOT public.is_test_user(v.user_id) OR v.user_id = auth.uid() OR public.is_sim_admin() OR public.is_test_user(auth.uid()))
  GROUP BY v.option_index
$$;
GRANT EXECUTE ON FUNCTION public.poll_vote_counts(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "hide moderated posts" ON public.posts;
CREATE POLICY "hide moderated posts" ON public.posts AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (NOT public.is_community_hidden('post', id) OR author_id = auth.uid() OR public.is_community_moderator());
DROP POLICY IF EXISTS "hide moderated comments" ON public.comments;
CREATE POLICY "hide moderated comments" ON public.comments AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING ((NOT public.is_community_hidden('comment', id) AND NOT public.is_community_hidden('post', post_id)) OR author_id = auth.uid() OR public.is_community_moderator());
DROP POLICY IF EXISTS "hide moderated polls" ON public.polls;
CREATE POLICY "hide moderated polls" ON public.polls AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (NOT public.is_community_hidden('poll', id) OR public.is_community_moderator());

DROP POLICY IF EXISTS "hidden identifiers public" ON public.community_hidden;
CREATE POLICY "moderators read hidden" ON public.community_hidden FOR SELECT TO authenticated
  USING (public.is_community_moderator());

DROP POLICY IF EXISTS "votes readable" ON public.poll_votes;
CREATE POLICY "read own votes" ON public.poll_votes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles readable" ON public.profiles;
CREATE POLICY "read own or public author profiles" ON public.profiles FOR SELECT TO anon, authenticated
  USING (id = auth.uid() OR public.is_public_profile(id));