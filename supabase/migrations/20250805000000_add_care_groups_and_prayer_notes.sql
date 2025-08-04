-- Create care_groups table
CREATE TABLE IF NOT EXISTS public.care_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create user_care_groups table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.user_care_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  care_group_id UUID REFERENCES public.care_groups(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, care_group_id)
);

-- Create prayer_notes table
CREATE TABLE IF NOT EXISTS public.prayer_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  care_group_id UUID REFERENCES public.care_groups(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_prayer_notes_user_id ON public.prayer_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_notes_care_group_id ON public.prayer_notes(care_group_id);
CREATE INDEX IF NOT EXISTS idx_prayer_notes_date ON public.prayer_notes(date);

-- Enable Row Level Security
ALTER TABLE public.care_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_care_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for care_groups
CREATE POLICY "Users can view their care groups" ON public.care_groups
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_care_groups 
    WHERE user_care_groups.user_id = auth.uid() 
    AND user_care_groups.care_group_id = care_groups.id
  ));

CREATE POLICY "Care group creators can manage their groups" ON public.care_groups
  FOR ALL
  USING (created_by = auth.uid());

-- Create policies for user_care_groups
CREATE POLICY "Users can view their care group memberships" ON public.user_care_groups
  FOR SELECT
  USING (user_id = auth.uid() OR 
         EXISTS (
           SELECT 1 FROM public.user_care_groups ucg2 
           WHERE ucg2.care_group_id = user_care_groups.care_group_id 
           AND ucg2.user_id = auth.uid() 
           AND ucg2.role = 'leader'
         ));

-- Create policies for prayer_notes
CREATE POLICY "Users can view their own prayer notes" ON public.prayer_notes
  FOR SELECT
  USING (user_id = auth.uid() OR 
         (NOT is_private AND EXISTS (
           SELECT 1 FROM public.user_care_groups 
           WHERE user_care_groups.user_id = auth.uid() 
           AND user_care_groups.care_group_id = prayer_notes.care_group_id
         )));

CREATE POLICY "Users can manage their own prayer notes" ON public.prayer_notes
  FOR ALL
  USING (user_id = auth.uid());

-- Create storage bucket for care group images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('care-group-images', 'care-group-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for care group images
CREATE POLICY "Care group images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'care-group-images');

CREATE POLICY "Users can upload care group images" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'care-group-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own care group images" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'care-group-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own care group images" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'care-group-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
