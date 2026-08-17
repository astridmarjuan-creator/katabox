-- KataBox schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query) once per project.
-- Safe to re-run: uses "if not exists" / "or replace" where possible.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists languages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#3366ff',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
-- case-insensitive uniqueness
create unique index if not exists tags_user_lower_name_key on tags (user_id, lower(name));
create unique index if not exists languages_user_lower_name_key on languages (user_id, lower(name));

create table if not exists vocab (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  language_id uuid not null references languages (id) on delete cascade,
  word text not null,
  part_of_speech text not null default 'other'
    check (part_of_speech in ('noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom', 'other')),
  meaning text not null,
  example_sentence text,
  date_added timestamptz not null default now(),
  date_updated timestamptz not null default now()
);

create index if not exists vocab_user_id_idx on vocab (user_id);
create index if not exists vocab_language_id_idx on vocab (language_id);
create index if not exists vocab_word_idx on vocab using gin (to_tsvector('simple', word));
create index if not exists vocab_meaning_idx on vocab using gin (to_tsvector('simple', meaning));

create table if not exists synonyms (
  id uuid primary key default gen_random_uuid(),
  vocab_id uuid not null references vocab (id) on delete cascade,
  synonym text not null
);
create index if not exists synonyms_vocab_id_idx on synonyms (vocab_id);

create table if not exists vocab_tags (
  vocab_id uuid not null references vocab (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (vocab_id, tag_id)
);
create index if not exists vocab_tags_tag_id_idx on vocab_tags (tag_id);

create table if not exists review_stats (
  vocab_id uuid primary key references vocab (id) on delete cascade,
  ease_factor numeric not null default 2.5,
  interval_days integer not null default 0,
  next_review_date date not null default current_date,
  repetitions integer not null default 0,
  last_result text,
  last_reviewed_at timestamptz
);

-- History of individual review events, used for the stats dashboard
-- (streaks + the 30-day activity chart).
create table if not exists review_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vocab_id uuid not null references vocab (id) on delete cascade,
  grade text not null check (grade in ('again', 'hard', 'good', 'easy')),
  reviewed_at timestamptz not null default now()
);
create index if not exists review_log_user_id_idx on review_log (user_id);
create index if not exists review_log_reviewed_at_idx on review_log (reviewed_at);

-- ---------------------------------------------------------------------------
-- Keep date_updated fresh + auto-create a review_stats row for new vocab
-- ---------------------------------------------------------------------------

create or replace function set_vocab_date_updated()
returns trigger as $$
begin
  new.date_updated = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_vocab_date_updated on vocab;
create trigger trg_vocab_date_updated
  before update on vocab
  for each row
  execute function set_vocab_date_updated();

create or replace function create_review_stats_for_vocab()
returns trigger as $$
begin
  insert into review_stats (vocab_id, next_review_date)
  values (new.id, current_date)
  on conflict (vocab_id) do nothing;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_vocab_create_review_stats on vocab;
create trigger trg_vocab_create_review_stats
  after insert on vocab
  for each row
  execute function create_review_stats_for_vocab();

-- ---------------------------------------------------------------------------
-- Row Level Security -- everything is scoped to the signed-in user.
-- ---------------------------------------------------------------------------

alter table languages enable row level security;
alter table tags enable row level security;
alter table vocab enable row level security;
alter table synonyms enable row level security;
alter table vocab_tags enable row level security;
alter table review_stats enable row level security;
alter table review_log enable row level security;

drop policy if exists languages_owner on languages;
create policy languages_owner on languages
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists tags_owner on tags;
create policy tags_owner on tags
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists vocab_owner on vocab;
create policy vocab_owner on vocab
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists synonyms_owner on synonyms;
create policy synonyms_owner on synonyms
  for all using (
    exists (select 1 from vocab where vocab.id = synonyms.vocab_id and vocab.user_id = auth.uid())
  ) with check (
    exists (select 1 from vocab where vocab.id = synonyms.vocab_id and vocab.user_id = auth.uid())
  );

drop policy if exists vocab_tags_owner on vocab_tags;
create policy vocab_tags_owner on vocab_tags
  for all using (
    exists (select 1 from vocab where vocab.id = vocab_tags.vocab_id and vocab.user_id = auth.uid())
  ) with check (
    exists (select 1 from vocab where vocab.id = vocab_tags.vocab_id and vocab.user_id = auth.uid())
  );

drop policy if exists review_stats_owner on review_stats;
create policy review_stats_owner on review_stats
  for all using (
    exists (select 1 from vocab where vocab.id = review_stats.vocab_id and vocab.user_id = auth.uid())
  ) with check (
    exists (select 1 from vocab where vocab.id = review_stats.vocab_id and vocab.user_id = auth.uid())
  );

drop policy if exists review_log_owner on review_log;
create policy review_log_owner on review_log
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
