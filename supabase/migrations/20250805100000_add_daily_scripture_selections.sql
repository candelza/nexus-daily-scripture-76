-- Create daily_scripture_selections table for random scripture calendar
CREATE TABLE public.daily_scripture_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  scriptures JSONB NOT NULL,
  selected_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_scripture_selections ENABLE ROW LEVEL SECURITY;

-- Create policies (public readable for all users)
CREATE POLICY "Daily scripture selections are publicly readable" 
ON public.daily_scripture_selections 
FOR SELECT 
USING (true);

CREATE POLICY "Daily scripture selections are publicly writable" 
ON public.daily_scripture_selections 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Daily scripture selections are publicly updatable" 
ON public.daily_scripture_selections 
FOR UPDATE 
USING (true);

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_daily_scripture_selections_updated_at
BEFORE UPDATE ON public.daily_scripture_selections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster date lookups
CREATE INDEX idx_daily_scripture_selections_date ON public.daily_scripture_selections(date);