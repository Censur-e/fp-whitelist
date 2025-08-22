-- Create whitelist table for Roblox products
CREATE TABLE IF NOT EXISTS public.whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(place_id, product_name)
);

-- Enable Row Level Security (not needed for this use case but good practice)
ALTER TABLE public.whitelist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is an admin-only system)
CREATE POLICY "Allow all operations on whitelist" ON public.whitelist
  FOR ALL USING (true) WITH CHECK (true);
