-- ============================================================
-- Plaid Integration Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Tabla para almacenar las conexiones bancarias de Plaid
CREATE TABLE IF NOT EXISTS plaid_items (
  id                  serial primary key,
  user_id             uuid not null references auth.users(id) on delete cascade,
  plaid_item_id       text not null unique,
  plaid_access_token  text not null,  -- SENSIBLE: nunca exponer al cliente
  institution_id      text,
  institution_name    text,
  supabase_account_id int references accounts(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON plaid_items(user_id);

-- RLS: cada usuario solo ve sus propias conexiones
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plaid_items_own" ON plaid_items
  FOR ALL USING (auth.uid() = user_id);

-- El access_token nunca debe ser seleccionable desde el cliente
-- La Edge Function usa service_role para acceder a él

-- Agregar columna supabase_account_id si la tabla ya existe
ALTER TABLE plaid_items
  ADD COLUMN IF NOT EXISTS supabase_account_id int references accounts(id) on delete set null;

-- Cursor para /transactions/sync (incremental updates)
ALTER TABLE plaid_items
  ADD COLUMN IF NOT EXISTS transactions_cursor text;

-- ID de transacción de Plaid para manejar updates y deletes
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS plaid_transaction_id text unique;
