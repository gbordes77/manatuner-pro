-- ManaTuner Pro - Supabase Database Setup
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deck_analyses table
CREATE TABLE public.deck_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  deck_list TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  name TEXT,
  format TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deck_templates table for featured/popular decks
CREATE TABLE public.deck_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  archetype TEXT,
  deck_list TEXT NOT NULL,
  mana_curve JSONB,
  color_identity TEXT[],
  avg_cmc DECIMAL,
  land_count INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_deck_analyses_user_id ON public.deck_analyses(user_id);
CREATE INDEX idx_deck_analyses_created_at ON public.deck_analyses(created_at DESC);
CREATE INDEX idx_deck_analyses_public ON public.deck_analyses(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_deck_templates_featured ON public.deck_templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_deck_templates_format ON public.deck_templates(format);
CREATE INDEX idx_deck_templates_upvotes ON public.deck_templates(upvotes DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deck_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deck_templates ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Deck analyses policies
-- Users can view their own analyses
CREATE POLICY "Users can view own analyses" ON public.deck_analyses
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view public analyses
CREATE POLICY "Anyone can view public analyses" ON public.deck_analyses
  FOR SELECT USING (is_public = TRUE);

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses" ON public.deck_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own analyses
CREATE POLICY "Users can update own analyses" ON public.deck_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses" ON public.deck_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Deck templates policies
-- Anyone can view featured templates
CREATE POLICY "Anyone can view featured templates" ON public.deck_templates
  FOR SELECT USING (is_featured = TRUE);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample deck templates
INSERT INTO public.deck_templates (name, format, archetype, deck_list, is_featured, upvotes) VALUES
(
  'Mono Red Aggro',
  'Standard',
  'Aggro',
  '4 Lightning Bolt
4 Monastery Swiftspear
4 Goblin Guide
4 Lava Spike
4 Rift Bolt
4 Chain Lightning
4 Searing Blaze
4 Skewer the Critics
4 Light Up the Stage
20 Mountain
4 Ramunap Ruins',
  TRUE,
  150
),
(
  'Azorius Control',
  'Standard',
  'Control',
  '4 Counterspell
4 Wrath of God
4 Teferi, Hero of Dominaria
4 Opt
4 Fact or Fiction
2 Elspeth, Sun''s Champion
4 Hallowed Fountain
4 Glacial Fortress
4 Mystic Gate
4 Island
4 Plains
2 Ghost Quarter',
  TRUE,
  120
),
(
  'Simic Ramp',
  'Standard',
  'Ramp',
  '4 Llanowar Elves
4 Elvish Mystic
4 Cultivate
4 Explosive Vegetation
2 Primeval Titan
2 Craterhoof Behemoth
4 Beast Within
4 Counterspell
4 Breeding Pool
4 Hinterland Harbor
4 Forest
4 Island
2 Misty Rainforest',
  TRUE,
  95
);

-- Success message
SELECT 'ManaTuner Pro database setup complete! 🎉' as message; 