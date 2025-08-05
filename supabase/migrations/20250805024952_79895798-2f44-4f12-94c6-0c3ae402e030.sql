-- Create prayer_likes table
CREATE TABLE public.prayer_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prayer_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, prayer_id)
);

-- Create prayer_comments table
CREATE TABLE public.prayer_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prayer_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prayer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for prayer_likes
CREATE POLICY "Users can view all prayer likes" 
ON public.prayer_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own prayer likes" 
ON public.prayer_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer likes" 
ON public.prayer_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for prayer_comments
CREATE POLICY "Users can view all prayer comments" 
ON public.prayer_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own prayer comments" 
ON public.prayer_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayer comments" 
ON public.prayer_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer comments" 
ON public.prayer_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at on prayer_comments
CREATE TRIGGER update_prayer_comments_updated_at
BEFORE UPDATE ON public.prayer_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();