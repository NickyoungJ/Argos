-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT UNIQUE,
  tier TEXT NOT NULL DEFAULT 'FREE' CHECK (tier IN ('FREE', 'STANDARD', 'PRO')),
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Monitors table
CREATE TABLE monitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  product_name TEXT NOT NULL,
  target_option TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('VISUAL', 'SEMANTIC')),
  frequency INTEGER NOT NULL CHECK (frequency > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  fail_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Logs table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('CHANGED', 'UNCHANGED', 'ERROR')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_monitors_user_id ON monitors(user_id);
CREATE INDEX idx_monitors_is_active ON monitors(is_active) WHERE is_active = true;
CREATE INDEX idx_monitors_last_checked_at ON monitors(last_checked_at);
CREATE INDEX idx_logs_monitor_id ON logs(monitor_id);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone_number ON users(phone_number) WHERE phone_number IS NOT NULL;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Monitors: users can only access their own monitors
CREATE POLICY "Users can view own monitors" ON monitors
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own monitors" ON monitors
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own monitors" ON monitors
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own monitors" ON monitors
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Logs: users can only view logs for their own monitors
CREATE POLICY "Users can view own monitor logs" ON logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monitors
      WHERE monitors.id = logs.monitor_id
      AND monitors.user_id::text = auth.uid()::text
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, tier, credits)
  VALUES (
    NEW.id,
    NEW.email,
    'FREE',
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

