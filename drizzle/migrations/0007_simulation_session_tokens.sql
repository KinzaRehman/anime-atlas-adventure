CREATE TABLE public.sim_tokens (
  user_id uuid PRIMARY KEY,
  refresh_token text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.sim_tokens TO service_role;
ALTER TABLE public.sim_tokens ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.sim_tokens IS 'Saved sessions for synthetic test accounts only; service role access, no client policies.';