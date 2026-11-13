CREATE OR REPLACE FUNCTION public.validate_poll_vote() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$ DECLARE n int; BEGIN
  SELECT array_length(options, 1) INTO n FROM public.polls WHERE id = NEW.poll_id;
  IF n IS NULL OR NEW.option_index < 0 OR NEW.option_index >= n THEN RAISE EXCEPTION 'That poll option does not exist'; END IF;
  RETURN NEW; END $$;
CREATE TRIGGER validate_poll_vote BEFORE INSERT OR UPDATE ON public.poll_votes FOR EACH ROW EXECUTE FUNCTION public.validate_poll_vote();

CREATE OR REPLACE FUNCTION public.clear_post_notifications() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$ BEGIN DELETE FROM public.community_notifications WHERE kind = 'reply' AND target_id = OLD.id; RETURN OLD; END $$;
CREATE TRIGGER clear_post_notifications AFTER DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.clear_post_notifications();