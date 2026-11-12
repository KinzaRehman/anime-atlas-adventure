create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Traveler' check (char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now()
);
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable" on public.profiles for select to anon, authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(nullif(new.raw_user_meta_data->>'display_name',''), nullif(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1), 'Traveler'), 40));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade,
  author_name text,
  fandom text not null default 'General' check (char_length(fandom) between 1 and 40),
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 1 and 4000),
  spoiler text check (spoiler is null or char_length(spoiler) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "posts readable" on public.posts for select to anon, authenticated using (true);
create policy "create own posts" on public.posts for insert to authenticated with check (auth.uid() = author_id and author_name is null);
create policy "edit own posts" on public.posts for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id and author_name is null);
create policy "delete own posts" on public.posts for delete to authenticated using (auth.uid() = author_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index on public.comments(post_id, created_at);
grant select on public.comments to anon, authenticated;
grant insert, delete on public.comments to authenticated;
grant all on public.comments to service_role;
alter table public.comments enable row level security;
create policy "comments readable" on public.comments for select to anon, authenticated using (true);
create policy "create own comments" on public.comments for insert to authenticated with check (auth.uid() = author_id);
create policy "delete own comments" on public.comments for delete to authenticated using (auth.uid() = author_id);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);
grant select on public.post_likes to anon, authenticated;
grant insert, delete on public.post_likes to authenticated;
grant all on public.post_likes to service_role;
alter table public.post_likes enable row level security;
create policy "likes readable" on public.post_likes for select to anon, authenticated using (true);
create policy "like as self" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "unlike as self" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options text[] not null,
  created_at timestamptz not null default now()
);
grant select on public.polls to anon, authenticated;
grant all on public.polls to service_role;
alter table public.polls enable row level security;
create policy "polls readable" on public.polls for select to anon, authenticated using (true);

create table public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  option_index int not null check (option_index >= 0),
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);
grant select on public.poll_votes to anon, authenticated;
grant insert, update on public.poll_votes to authenticated;
grant all on public.poll_votes to service_role;
alter table public.poll_votes enable row level security;
create policy "votes readable" on public.poll_votes for select to anon, authenticated using (true);
create policy "vote as self" on public.poll_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "change own vote" on public.poll_votes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into public.polls (question, options) values
  ('Which genre should the next town festival celebrate?', array['Slice of Life','Sports','Mecha','Mystery']);
insert into public.posts (author_name, fandom, title, body, spoiler) values
  ('Mochi · Librarian', 'Slice of Life', 'Comfort anime for rainy days?', 'Looking for cozy slice-of-life shows with found-family vibes. Share your picks below!', null),
  ('Sora · Barista', 'General', 'Favourite opening theme of all time?', 'Quiz night debate got heated. Which opening song do you never skip?', null),
  ('AnimeAtlas Team', 'Art', 'Original art Friday', 'Share sketches of your own original characters. All skill levels welcome, original work only please.', null);