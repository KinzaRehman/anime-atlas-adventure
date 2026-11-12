create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  character text not null check (character in ('mochi','sora')),
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index on public.chat_messages(user_id, character, created_at);
grant select, insert, delete on public.chat_messages to authenticated;
grant all on public.chat_messages to service_role;
alter table public.chat_messages enable row level security;
create policy "read own chats" on public.chat_messages for select to authenticated using (auth.uid() = user_id);
create policy "write own chats" on public.chat_messages for insert to authenticated with check (auth.uid() = user_id);
create policy "clear own chats" on public.chat_messages for delete to authenticated using (auth.uid() = user_id);