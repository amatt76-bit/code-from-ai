-- ElderCompanion Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (both parents and children)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent profiles
CREATE TABLE IF NOT EXISTS parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hobbies JSONB DEFAULT '[]'::jsonb,
  preferred_time TEXT,
  mobility_level TEXT,
  dietary_preferences JSONB DEFAULT '[]'::jsonb,
  favorite_topics JSONB DEFAULT '[]'::jsonb,
  social_preference TEXT,
  tech_comfort TEXT,
  voice_personality TEXT DEFAULT 'warm',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  transcript JSONB,
  summary TEXT,
  sentiment TEXT,
  topics_discussed JSONB DEFAULT '[]'::jsonb,
  activities_mentioned JSONB DEFAULT '[]'::jsonb
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT,
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_started_at ON conversations(started_at);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled_for ON activities(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON parent_profiles(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for parent_profiles
CREATE TRIGGER update_parent_profiles_updated_at
  BEFORE UPDATE ON parent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- Uncomment the lines below if you want to add sample data

-- Sample parent user
-- INSERT INTO users (email, role, full_name, phone)
-- VALUES ('parent@example.com', 'parent', 'Jane Doe', '+1-555-0100')
-- ON CONFLICT (email) DO NOTHING;

-- Sample child user
-- INSERT INTO users (email, role, full_name, phone)
-- VALUES ('child@example.com', 'child', 'John Doe', '+1-555-0101')
-- ON CONFLICT (email) DO NOTHING;

-- Add comments to tables for documentation
COMMENT ON TABLE users IS 'Stores user accounts for both parents (elderly users) and children (caregivers)';
COMMENT ON TABLE parent_profiles IS 'Extended profile information for parent users including preferences and onboarding status';
COMMENT ON TABLE conversations IS 'Records of voice conversations between parents and the AI companion';
COMMENT ON TABLE activities IS 'Suggested or scheduled activities for parent users';

COMMENT ON COLUMN users.role IS 'User role: "parent" for elderly users, "child" for caregivers';
COMMENT ON COLUMN parent_profiles.voice_personality IS 'Preferred AI voice personality (e.g., warm, cheerful, calm)';
COMMENT ON COLUMN conversations.transcript IS 'JSON array of conversation messages with role and content';
COMMENT ON COLUMN conversations.sentiment IS 'Overall sentiment of the conversation (positive, neutral, negative)';
COMMENT ON COLUMN activities.completion_status IS 'Status: pending, completed, or cancelled';
