-- DATABASE_SETUP.sql
-- Fresh, idempotent DB schema for ChainFund project
-- Safe to run in Supabase SQL editor. Re-running will not break existing objects.

BEGIN;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  nonce VARCHAR(255) DEFAULT (floor(random() * 1000000)::text),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  target_amount DECIMAL(20, 8) NOT NULL,
  raised_amount DECIMAL(20, 8) DEFAULT 0,
  duration_days INTEGER NOT NULL,
  image_url TEXT,
  owner_address VARCHAR(42) NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, CLOSED, EXPIRED, SUCCESSFUL, DELETED
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (owner_address) REFERENCES users(address) ON DELETE RESTRICT
);

-- 3. Donations table
CREATE TABLE IF NOT EXISTS donations (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  donor_address VARCHAR(42) NOT NULL,
  amount_eth DECIMAL(20, 8) NOT NULL,
  amount_usd DECIMAL(20, 2),
  transaction_hash VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'CONFIRMED', -- CONFIRMED, PENDING, FAILED
  donated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (project_id) REFERENCES campaigns(project_id) ON DELETE RESTRICT,
  FOREIGN KEY (donor_address) REFERENCES users(address) ON DELETE RESTRICT
);

-- 4. Idempotent index creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_users_address') THEN
    CREATE INDEX idx_users_address ON users(address);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_campaigns_status') THEN
    CREATE INDEX idx_campaigns_status ON campaigns(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_campaigns_owner') THEN
    CREATE INDEX idx_campaigns_owner ON campaigns(owner_address);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_campaigns_project_id') THEN
    CREATE INDEX idx_campaigns_project_id ON campaigns(project_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_donations_project') THEN
    CREATE INDEX idx_donations_project ON donations(project_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_donations_donor') THEN
    CREATE INDEX idx_donations_donor ON donations(donor_address);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_donations_status') THEN
    CREATE INDEX idx_donations_status ON donations(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_donations_tx_hash') THEN
    CREATE INDEX idx_donations_tx_hash ON donations(transaction_hash);
  END IF;
END$$;

-- 5. Triggers: ensure referenced users exist and normalize addresses
-- Function: ensure a user row exists for campaign.owner_address
CREATE OR REPLACE FUNCTION ensure_user_exists_for_campaign()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.owner_address IS NOT NULL THEN
    NEW.owner_address := LOWER(NEW.owner_address);
    IF NOT EXISTS (SELECT 1 FROM users WHERE address = NEW.owner_address) THEN
      INSERT INTO users(address, is_admin, nonce, created_at, updated_at)
      VALUES (NEW.owner_address, false, floor(random() * 1000000)::text, NOW(), NOW());
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: ensure a user row exists for donation.donor_address
CREATE OR REPLACE FUNCTION ensure_user_exists_for_donation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.donor_address IS NOT NULL THEN
    NEW.donor_address := LOWER(NEW.donor_address);
    IF NOT EXISTS (SELECT 1 FROM users WHERE address = NEW.donor_address) THEN
      INSERT INTO users(address, is_admin, nonce, created_at, updated_at)
      VALUES (NEW.donor_address, false, floor(random() * 1000000)::text, NOW(), NOW());
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers (drop existing first to be idempotent)
DROP TRIGGER IF EXISTS trg_ensure_user_campaign ON campaigns;
CREATE TRIGGER trg_ensure_user_campaign
BEFORE INSERT OR UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION ensure_user_exists_for_campaign();

DROP TRIGGER IF EXISTS trg_ensure_user_donation ON donations;
CREATE TRIGGER trg_ensure_user_donation
BEFORE INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION ensure_user_exists_for_donation();

-- 6. Seed admin users (use the default admin addresses from appConfig)
-- Update these addresses if you modify ADMIN_ADDRESSES in src/config/appConfig.js
INSERT INTO users(address, is_admin, nonce, created_at, updated_at)
VALUES
  ('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', TRUE, floor(random() * 1000000)::text, NOW(), NOW()),
  ('0x8fa4c621f86eba072148b2fd6a20ccdb21b2f913', TRUE, floor(random() * 1000000)::text, NOW(), NOW())
ON CONFLICT (address) DO UPDATE SET is_admin = EXCLUDED.is_admin;

COMMIT;

-- Helpful queries (run separately as needed):
-- SELECT SUM(amount_eth) as total FROM donations WHERE project_id = 1 AND status = 'CONFIRMED';
-- SELECT donor_address, SUM(amount_eth) as total_donated FROM donations WHERE status = 'CONFIRMED' GROUP BY donor_address ORDER BY total_donated DESC LIMIT 10;
-- UPDATE campaigns SET status = 'SUCCESSFUL', updated_at = NOW() WHERE project_id = 1 AND raised_amount >= target_amount;
