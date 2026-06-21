create table if not exists projects (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  input_text text not null,
  input_type text not null,
  video_type text not null,
  image_style text not null,
  language text not null,
  scene_count integer not null default 0,
  content_pack jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_updated_at_idx on projects (updated_at desc);
create index if not exists projects_user_updated_at_idx on projects (user_id, updated_at desc);

create table if not exists plans (
  id uuid primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_name text not null default 'Free',
  generation_limit integer not null default 3,
  created_at timestamptz not null default now()
);

create table if not exists generations (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid null references projects(id) on delete set null,
  summary text not null,
  video_type text not null,
  image_style text not null,
  language text not null,
  scene_count integer not null default 0,
  subtitle_lines integer not null default 0,
  status text not null,
  error text null,
  created_at timestamptz not null default now()
);

create index if not exists generations_user_created_at_idx on generations (user_id, created_at desc);
