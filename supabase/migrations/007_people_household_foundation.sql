
-- Travel OS V4.0 People & Household Foundation
-- Safe to run multiple times.

alter table public.household_members
add column if not exists nickname text,
add column if not exists color_label text,
add column if not exists is_active boolean default true;

create index if not exists household_members_household_email_idx
on public.household_members (household_id, email);

create index if not exists household_members_household_user_idx
on public.household_members (household_id, user_id);

insert into public.household_members (
  household_id,
  user_id,
  email,
  display_name,
  nickname,
  role,
  is_active
)
select
  '00000000-0000-0000-0000-000000000001',
  u.id,
  u.email,
  case
    when lower(u.email) like '%acechols%' then 'Anthony'
    when lower(u.email) like '%steph%' then 'Stephanie'
    else split_part(u.email, '@', 1)
  end,
  case
    when lower(u.email) like '%acechols%' then 'Anthony'
    when lower(u.email) like '%steph%' then 'Stephanie'
    else split_part(u.email, '@', 1)
  end,
  'member',
  true
from auth.users u
where not exists (
  select 1
  from public.household_members hm
  where hm.household_id = '00000000-0000-0000-0000-000000000001'
    and hm.user_id = u.id
);
