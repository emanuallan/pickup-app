-- Create ratings table for user reviews
CREATE TABLE IF NOT EXISTS public.ratings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    rater_id text NOT NULL,
    rated_id text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ratings_rater_id ON public.ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_id ON public.ratings(rated_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.ratings(created_at);

-- Create unique constraint to prevent duplicate ratings from same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_unique_rater_rated 
ON public.ratings(rater_id, rated_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Anyone can read ratings
CREATE POLICY "Anyone can read ratings" ON public.ratings
    FOR SELECT USING (true);

-- Policy: Users can only create ratings for others, not themselves
CREATE POLICY "Users can create ratings for others" ON public.ratings
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        rater_id = auth.email() AND
        rater_id != rated_id
    );

-- Policy: Users can only update their own ratings
CREATE POLICY "Users can update their own ratings" ON public.ratings
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND 
        rater_id = auth.email()
    );

-- Policy: Users can only delete their own ratings
CREATE POLICY "Users can delete their own ratings" ON public.ratings
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND 
        rater_id = auth.email()
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_ratings_updated_at
    BEFORE UPDATE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.ratings TO authenticated;
GRANT SELECT ON public.ratings TO anon;