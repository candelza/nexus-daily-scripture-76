-- Create user_groups table
CREATE TABLE public.user_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_memberships table
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Enable RLS
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies for user_groups (publicly readable)
CREATE POLICY "User groups are publicly readable" 
ON public.user_groups 
FOR SELECT 
USING (true);

-- Create policies for group_memberships (users can manage their own memberships)
CREATE POLICY "Users can view their own group memberships" 
ON public.group_memberships 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own group memberships" 
ON public.group_memberships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own group memberships" 
ON public.group_memberships 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own group memberships" 
ON public.group_memberships 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create policies for avatar uploads
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

-- Add trigger for updated_at on user_groups
CREATE TRIGGER update_user_groups_updated_at
BEFORE UPDATE ON public.user_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default groups
INSERT INTO public.user_groups (name, description) VALUES 
('เยาวชน', 'กลุ่มเยาวชนและนักเรียน'),
('ผู้ใหญ่', 'กลุ่มผู้ใหญ่และวัยทำงาน'),
('ผู้สูงอายุ', 'กลุ่มผู้สูงอายุและผู้เกษียณ'),
('ครอบครัว', 'กลุ่มครอบครัวและเด็กเล็ก');