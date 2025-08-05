-- Create user groups table
CREATE TABLE public.user_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;

-- Create group memberships table
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Enable Row Level Security
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create policies for user_groups
CREATE POLICY "Public groups are viewable by everyone" 
ON public.user_groups 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create groups" 
ON public.user_groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" 
ON public.user_groups 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups" 
ON public.user_groups 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create policies for group_memberships
CREATE POLICY "Users can view group memberships" 
ON public.group_memberships 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join groups" 
ON public.group_memberships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" 
ON public.group_memberships 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trigger for user_groups timestamps
CREATE TRIGGER update_user_groups_updated_at
BEFORE UPDATE ON public.user_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default groups
INSERT INTO public.user_groups (name, description, created_by, is_public) VALUES 
  ('ครอบครัว', 'กลุ่มสำหรับสมาชิกในครอบครัว', '00000000-0000-0000-0000-000000000000', true),
  ('เพื่อน', 'กลุ่มสำหรับเพื่อนๆ', '00000000-0000-0000-0000-000000000000', true),
  ('คริสตจักร', 'กลุ่มสำหรับสมาชิกในคริสตจักร', '00000000-0000-0000-0000-000000000000', true),
  ('นักเรียน', 'กลุ่มสำหรับนักเรียนและนักศึกษา', '00000000-0000-0000-0000-000000000000', true);