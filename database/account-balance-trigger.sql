-- ============================================================
-- Chill Numbers — Account Balance Auto-Update Trigger
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================
-- This trigger keeps accounts.current_balance in sync
-- automatically whenever a transaction is inserted, updated, or deleted.
-- Logic:
--   type=1 (Income)  → adds to balance
--   type=2 (Expense) → subtracts from balance
-- Only completed transactions (status=0) affect the balance.
-- NOTE: Plaid-linked accounts (description contains '[plaid:') are excluded —
--       their balance is managed exclusively by the Plaid sync process.
-- ============================================================

create or replace function update_account_balance()
returns trigger language plpgsql security definer as $$
declare
  v_delta      numeric(18,2) := 0;
  v_is_plaid   boolean := false;
begin

  -- ── DELETE: reverse the old transaction's effect ──────────────────────────
  if (TG_OP = 'DELETE') then
    if OLD.account_id is not null and OLD.status = 0 then
      -- Skip Plaid-linked accounts
      select (description like '%[plaid:%') into v_is_plaid
        from accounts where id = OLD.account_id;
      if not v_is_plaid then
        if OLD.type = 1 then
          v_delta := -OLD.amount;
        else
          v_delta := OLD.amount;
        end if;
        update accounts
          set current_balance = current_balance + v_delta,
              updated_at = now()
          where id = OLD.account_id;
      end if;
    end if;
    return OLD;
  end if;

  -- ── INSERT: apply the new transaction ─────────────────────────────────────
  if (TG_OP = 'INSERT') then
    if NEW.account_id is not null and NEW.status = 0 then
      -- Skip Plaid-linked accounts
      select (description like '%[plaid:%') into v_is_plaid
        from accounts where id = NEW.account_id;
      if not v_is_plaid then
        if NEW.type = 1 then
          v_delta := NEW.amount;
        else
          v_delta := -NEW.amount;
        end if;
        update accounts
          set current_balance = current_balance + v_delta,
              updated_at = now()
          where id = NEW.account_id;
      end if;
    end if;
    return NEW;
  end if;

  -- ── UPDATE: reverse old effect, apply new effect ──────────────────────────
  if (TG_OP = 'UPDATE') then
    -- Reverse old
    if OLD.account_id is not null and OLD.status = 0 then
      select (description like '%[plaid:%') into v_is_plaid
        from accounts where id = OLD.account_id;
      if not v_is_plaid then
        if OLD.type = 1 then
          v_delta := -OLD.amount;
        else
          v_delta := OLD.amount;
        end if;
        update accounts
          set current_balance = current_balance + v_delta,
              updated_at = now()
          where id = OLD.account_id;
      end if;
    end if;
    -- Apply new
    v_is_plaid := false;
    if NEW.account_id is not null and NEW.status = 0 then
      select (description like '%[plaid:%') into v_is_plaid
        from accounts where id = NEW.account_id;
      if not v_is_plaid then
        if NEW.type = 1 then
          v_delta := NEW.amount;
        else
          v_delta := -NEW.amount;
        end if;
        update accounts
          set current_balance = current_balance + v_delta,
              updated_at = now()
          where id = NEW.account_id;
      end if;
    end if;
    return NEW;
  end if;

  return NEW;
end;
$$;

-- Drop existing trigger if any, then recreate
drop trigger if exists trg_update_account_balance on transactions;

create trigger trg_update_account_balance
  after insert or update or delete on transactions
  for each row execute procedure update_account_balance();

-- ============================================================
-- OPTIONAL: Recalculate balances for non-Plaid accounts only
-- Run this once after updating the trigger to fix existing data
-- ============================================================
update accounts a
set current_balance = a.initial_balance + coalesce((
  select sum(case when t.type = 1 then t.amount else -t.amount end)
  from transactions t
  where t.account_id = a.id
    and t.status = 0
), 0),
updated_at = now()
where a.description not like '%[plaid:%' or a.description is null;
