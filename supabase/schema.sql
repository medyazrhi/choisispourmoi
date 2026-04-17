-- ==========================================
-- SUPABASE SCHEMA - CHOISISPOURMOI
-- ==========================================

-- 1. Create Tables
CREATE TABLE public.polls (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  short_id text UNIQUE NOT NULL,
  question text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '7 days') NOT NULL
);

CREATE TABLE public.poll_options (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  position integer NOT NULL CHECK (position >= 0 AND position <= 3)
);

CREATE TABLE public.votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id uuid REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  voter_fingerprint text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_vote_per_option UNIQUE (option_id, voter_fingerprint)
);

-- 2. Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('poll-images', 'poll-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Setup Row Level Security (RLS)
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Tables

-- Polls: Everyone can read, authenticated or anon can create (if we allow anon creation, otherwise modify)
-- Here we allow public reads (because friends need to see the poll)
CREATE POLICY "Enable read access for all users on polls" 
ON public.polls FOR SELECT 
USING (true);

-- Anyone can insert a new poll
CREATE POLICY "Enable insert access for all users on polls" 
ON public.polls FOR INSERT 
WITH CHECK (true);

-- Poll Options: Everyone can read
CREATE POLICY "Enable read access for all users on options" 
ON public.poll_options FOR SELECT 
USING (true);

-- Anyone can insert poll options (when creating the poll)
CREATE POLICY "Enable insert access for all users on options" 
ON public.poll_options FOR INSERT 
WITH CHECK (true);

-- Votes: Everyone can read the votes (to show results)
CREATE POLICY "Enable read access for all users on votes" 
ON public.votes FOR SELECT 
USING (true);

-- Anyone can insert a vote (friends voting without accounts)
CREATE POLICY "Enable insert access for all users on votes" 
ON public.votes FOR INSERT 
WITH CHECK (true);

-- 5. RLS Policies for Storage
-- Allow anyone to read the images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'poll-images');

-- Allow anyone to upload new images for their polls
CREATE POLICY "Public Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'poll-images');
