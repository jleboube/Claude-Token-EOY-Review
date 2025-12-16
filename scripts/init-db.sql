-- Claude Token Share Leaderboard Schema
-- This script runs automatically when the PostgreSQL container is first created

-- Users who have opted into the leaderboard
CREATE TABLE IF NOT EXISTS leaderboard_users (
  id SERIAL PRIMARY KEY,
  x_username VARCHAR(50) NOT NULL UNIQUE,
  x_user_id VARCHAR(50),
  display_name VARCHAR(100),
  opted_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage snapshots (allows multiple entries per user for different time periods)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES leaderboard_users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER, -- NULL for yearly totals
  total_tokens BIGINT NOT NULL,
  total_input_tokens BIGINT NOT NULL,
  total_output_tokens BIGINT NOT NULL,
  total_cost DECIMAL(10, 2),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- Indexes for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_entries_tokens ON leaderboard_entries(total_tokens DESC);
CREATE INDEX IF NOT EXISTS idx_entries_year_month ON leaderboard_entries(year, month);
CREATE INDEX IF NOT EXISTS idx_users_username ON leaderboard_users(x_username);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON leaderboard_entries(user_id);

-- Grant permissions (in case running as different user)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO claude;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO claude;
