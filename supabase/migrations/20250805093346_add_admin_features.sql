-- Create admin_roles table
create table public.admin_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'moderator' check (role in ('admin', 'moderator')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create admin_invites table
create table public.admin_invites (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  role text not null default 'moderator' check (role in ('admin', 'moderator')),
  invited_by uuid references auth.users(id) on delete set null,
  token text not null unique,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  used_at timestamp with time zone
);

-- Create prayer_topics table
create table public.prayer_topics (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  is_active boolean default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admin_roles enable row level security;
alter table public.admin_invites enable row level security;
alter table public.prayer_topics enable row level security;

-- Create policies for admin_roles
create policy "Admins can view all admin roles"
  on public.admin_roles
  for select
  using (auth.uid() in (select user_id from public.admin_roles where role = 'admin'));

create policy "Admins can insert admin roles"
  on public.admin_roles
  for insert
  with check (auth.uid() in (select user_id from public.admin_roles where role = 'admin'));

create policy "Admins can update admin roles"
  on public.admin_roles
  for update
  using (auth.uid() in (select user_id from public.admin_roles where role = 'admin'));

-- Create policies for admin_invites
create policy "Admins can manage invites"
  on public.admin_invites
  for all
  using (auth.uid() in (select user_id from public.admin_roles where role = 'admin'));

-- Create policies for prayer_topics
create policy "Enable read access for all users"
  on public.prayer_topics
  for select
  using (true);

create policy "Enable insert for admins and moderators"
  on public.prayer_topics
  for insert
  with check (auth.uid() in (select user_id from public.admin_roles));

create policy "Enable update for admins and moderators"
  on public.prayer_topics
  for update
  using (auth.uid() in (select user_id from public.admin_roles));

-- Create function to set updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_admin_roles_updated_at
  before update on public.admin_roles
  for each row
  execute function public.handle_updated_at();

create trigger handle_prayer_topics_updated_at
  before update on public.prayer_topics
  for each row
  execute function public.handle_updated_at();

-- Create function to generate random token
create or replace function public.generate_random_token(length integer)
returns text as $$
declare
  chars text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  result text := '';
  i integer := 0;
begin
  for i in 1..length loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Insert initial admin user (replace with candelaz28@gmail.com's user ID after they sign up)
-- This needs to be run manually after the user signs up
-- insert into public.admin_roles (user_id, role) 
-- values ('user-uuid-here', 'admin');
