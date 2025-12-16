-- ===== SUPABASE DATABASE SETUP =====
-- Chạy các SQL queries sau trong Supabase SQL Editor

-- 1. Users table (quản lý user accounts)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  nonce VARCHAR(255) DEFAULT (floor(random() * 1000000)::text),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_address ON users(address);

-- 2. Campaigns table (lưu thông tin campaigns)
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
  FOREIGN KEY (owner_address) REFERENCES users(address)
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_owner ON campaigns(owner_address);
CREATE INDEX idx_campaigns_project_id ON campaigns(project_id);

-- 3. Donations table (quản lý donations)
CREATE TABLE IF NOT EXISTS donations (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  donor_address VARCHAR(42) NOT NULL,
  amount_eth DECIMAL(20, 8) NOT NULL,
  amount_usd DECIMAL(20, 2),
  transaction_hash VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'CONFIRMED', -- CONFIRMED, PENDING, FAILED
  donated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (project_id) REFERENCES campaigns(project_id),
  FOREIGN KEY (donor_address) REFERENCES users(address)
);

CREATE INDEX idx_donations_project ON donations(project_id);
CREATE INDEX idx_donations_donor ON donations(donor_address);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_tx_hash ON donations(transaction_hash);

-- 4. Enable RLS (Row Level Security) - tùy chọn
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- 5. Create policies (tùy chọn - cho phép user chỉ xem dữ liệu của họ)
-- CREATE POLICY "Users can view their own data"
--   ON users FOR SELECT
--   USING (auth.uid()::text = address);

-- ===== QUERIES TIỆN DỤNG =====

-- Lấy tổng donation của 1 campaign
-- SELECT SUM(amount_eth) as total FROM donations WHERE project_id = 1 AND status = 'CONFIRMED';

-- Lấy danh sách top donors
-- SELECT donor_address, SUM(amount_eth) as total_donated FROM donations 
-- WHERE status = 'CONFIRMED' GROUP BY donor_address ORDER BY total_donated DESC LIMIT 10;

-- Lấy campaigns của 1 owner
-- SELECT * FROM campaigns WHERE owner_address = '0x...' ORDER BY created_at DESC;

-- Cập nhật status campaign khi raised >= target
-- UPDATE campaigns SET status = 'SUCCESSFUL', updated_at = NOW() 
-- WHERE project_id = 1 AND raised_amount >= target_amount;
