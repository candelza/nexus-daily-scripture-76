-- Add display_name column to prayer_requests table
ALTER TABLE public.prayer_requests 
ADD COLUMN display_name TEXT;