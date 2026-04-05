-- ============================================================
-- Chill Numbers — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- ============================================================
-- CATEGORIES (globales, no por usuario)
-- ============================================================
create table if not exists categories (
  id          serial primary key,
  name        text not null,
  type        int  not null,  -- 0=Income, 1=Expense
  display_order int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Categorías globales por defecto
insert into categories (name, type, display_order) values
  ('Supply',    0, 1),
  ('Service',   0, 2),
  ('Transport', 0, 3),
  ('Payroll',   0, 4),
  ('Marketing', 0, 5),
  ('Other',     0, 6),
  ('Supply',    1, 1),
  ('Service',   1, 2),
  ('Transport', 1, 3),
  ('Payroll',   1, 4),
  ('Marketing', 1, 5),
  ('Other',     1, 6)
on conflict do nothing;

-- ============================================================
-- ACCOUNTS
-- ============================================================
create table if not exists accounts (
  id              serial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  code            text,
  type            int  not null,  -- 1=Asset,2=Liability,3=Equity,4=Income,5=Expense
  sub_type        int  not null,
  initial_balance numeric(18,2) not null default 0,
  current_balance numeric(18,2) not null default 0,
  description     text,
  currency        text not null default 'USD',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_accounts_user_id on accounts(user_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table if not exists transactions (
  id           serial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         int  not null,  -- 1=Income, 2=Expense
  amount       numeric(18,2) not null,
  category_id  int  not null references categories(id),
  account_id   int  references accounts(id),
  description  text not null,
  date         date not null,
  notes        text,
  status       int  not null default 0,  -- 0=Completed, 1=Pending
  is_from_plaid boolean not null default false,
  is_business_transaction boolean,
  merchant_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_date    on transactions(date);
create index if not exists idx_transactions_category on transactions(category_id);

-- ============================================================
-- EMPLOYEES
-- ============================================================
create table if not exists employees (
  id              serial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  first_name      text not null,
  last_name       text not null,
  email           text not null,
  phone           text,
  position        text not null,
  salary          numeric(18,2) not null default 0,
  payroll_type    int  not null,  -- 1=Hourly,2=Weekly,3=Biweekly,4=Monthly,5=Quarterly,6=Annual,7=Contract,8=Provider
  hourly_rate     numeric(18,2),
  hire_date       date,
  status          int  not null default 1,  -- 1=Active, 2=Inactive
  address_street  text,
  address_city    text,
  address_state   text,
  address_zip     text,
  emergency_name  text,
  emergency_rel   text,
  emergency_phone text,
  tax_ssn_last4   text,
  tax_id          text,
  tax_w4_status   text,
  benefits_health    boolean not null default false,
  benefits_dental    boolean not null default false,
  benefits_401k      boolean not null default false,
  benefits_pto       int     not null default 0,
  notes           text,
  avatar          text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, email)
);
create index if not exists idx_employees_user_id on employees(user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id           serial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         text not null,      -- transaction|report|employee|system|reminder|alert
  priority     text not null default 'medium',  -- low|medium|high|urgent
  title        text not null,
  message      text not null,
  is_read      boolean not null default false,
  action_url   text,
  action_label text,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists idx_notifications_user_id on notifications(user_id, is_read);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists subscriptions (
  id                    serial primary key,
  user_id               uuid not null references auth.users(id) on delete cascade,
  status                int  not null default 0,  -- 0=Trial,1=Active,2=PastDue,3=Canceled,4=Expired
  plan                  int  not null default 0,  -- 0=Free,1=Monthly,2=Annual
  trial_started_at      timestamptz not null default now(),
  trial_ends_at         timestamptz not null default (now() + interval '30 days'),
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  canceled_at           timestamptz,
  stripe_customer_id    text,
  stripe_subscription_id text,
  stripe_price_id       text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique(user_id)
);

-- ============================================================
-- WEEK CLOSURES
-- ============================================================
create table if not exists week_closures (
  id          serial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  week_number int  not null,
  year        int  not null,
  month       int  not null,
  start_date  date not null,
  end_date    date not null,
  total_income   numeric(18,2) not null default 0,
  total_expenses numeric(18,2) not null default 0,
  net_profit     numeric(18,2) not null default 0,
  notes       text,
  closed_at   timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index if not exists idx_week_closures_user_id on week_closures(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table accounts       enable row level security;
alter table transactions   enable row level security;
alter table employees      enable row level security;
alter table notifications  enable row level security;
alter table subscriptions  enable row level security;
alter table week_closures  enable row level security;

-- Policies: cada usuario solo ve sus propios datos
create policy "accounts_own"      on accounts      for all using (auth.uid() = user_id);
create policy "transactions_own"  on transactions  for all using (auth.uid() = user_id);
create policy "employees_own"     on employees     for all using (auth.uid() = user_id);
create policy "notifications_own" on notifications for all using (auth.uid() = user_id);
create policy "subscriptions_own" on subscriptions for all using (auth.uid() = user_id);
create policy "week_closures_own" on week_closures for all using (auth.uid() = user_id);

-- Categories son públicas (solo lectura)
alter table categories enable row level security;
create policy "categories_read" on categories for select using (true);

-- ============================================================
-- TRIGGER: crear trial automático al registrar usuario
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into subscriptions (user_id, status, plan, trial_started_at, trial_ends_at)
  values (new.id, 0, 0, now(), now() + interval '30 days');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
