-- Fix security issues for prayer_likes and prayer_comments by requiring authentication

-- Update prayer_likes policies to require authentication
DROP POLICY IF EXISTS "Users can view all prayer likes" ON public.prayer_likes;
DROP POLICY IF EXISTS "Users can create their own prayer likes" ON public.prayer_likes;
DROP POLICY IF EXISTS "Users can delete their own prayer likes" ON public.prayer_likes;

CREATE POLICY "Authenticated users can view all prayer likes" 
ON public.prayer_likes 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create their own prayer likes" 
ON public.prayer_likes 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own prayer likes" 
ON public.prayer_likes 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Update prayer_comments policies to require authentication
DROP POLICY IF EXISTS "Users can view all prayer comments" ON public.prayer_comments;
DROP POLICY IF EXISTS "Users can create their own prayer comments" ON public.prayer_comments;
DROP POLICY IF EXISTS "Users can update their own prayer comments" ON public.prayer_comments;
DROP POLICY IF EXISTS "Users can delete their own prayer comments" ON public.prayer_comments;

CREATE POLICY "Authenticated users can view all prayer comments" 
ON public.prayer_comments 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create their own prayer comments" 
ON public.prayer_comments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own prayer comments" 
ON public.prayer_comments 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own prayer comments" 
ON public.prayer_comments 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);